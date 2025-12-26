import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { smoothStream, streamText } from "ai";
import { z } from "zod";
import { getCharacter, isValidCharacterSlug } from "@/lib/characters";
import { env } from "@/lib/env";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "@/lib/models";
import { createClient } from "@/lib/supabase/server";
import { generateConversationTitle } from "@/lib/title-generation";

const VALID_MODEL_IDS = AVAILABLE_MODELS.map((m) => m.id) as [
  string,
  ...string[],
];

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

// Accept messages array from useChat TextStreamChatTransport
// Parts can be text, step-start, tool-call, etc. - we only care about text parts
const TextPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const OtherPartSchema = z
  .object({
    type: z.string(),
  })
  .passthrough();

const MessagePartSchema = z.union([TextPartSchema, OtherPartSchema]);

const UIMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(MessagePartSchema),
});

const ChatRequestSchema = z.object({
  messages: z.array(UIMessageSchema),
  characterSlug: z.string(),
  conversationId: z.uuid().nullish(), // accepts null, undefined, or valid UUID
  model: z.enum(VALID_MODEL_IDS).nullish(),
});

// Extract text content from UI message parts (only text parts)
function getMessageText(parts: z.infer<typeof MessagePartSchema>[]): string {
  return parts
    .filter((p): p is z.infer<typeof TextPartSchema> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// Convert UI messages to format expected by streamText
function convertMessages(messages: z.infer<typeof UIMessageSchema>[]) {
  return messages.map((m) => ({
    role: m.role,
    content: getMessageText(m.parts),
  }));
}

export async function POST(request: Request) {
  // 1. Authenticate user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Parse and validate request body
  const body = await request.json();
  const parsed = ChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    console.error("Chat API validation error:", parsed.error.format());
    return new Response(
      JSON.stringify({
        error: "Invalid request body",
        details: parsed.error.format(),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const {
    messages: uiMessages,
    characterSlug,
    conversationId,
    model,
  } = parsed.data;
  const selectedModel = model ?? DEFAULT_MODEL.id;
  const messages = convertMessages(uiMessages);

  // Get the last user message for saving and title
  const lastUserMessage = messages.filter((m) => m.role === "user").pop();
  const userMessageText = lastUserMessage?.content ?? "";

  // 3. Validate character
  if (!isValidCharacterSlug(characterSlug)) {
    return new Response("Invalid character", { status: 400 });
  }

  const character = getCharacter(characterSlug);
  if (!character) {
    return new Response("Character not found", { status: 404 });
  }

  // 4. Handle conversation creation/verification
  let actualConversationId = conversationId;
  let isNewConversation = false;
  let currentTitle = "";

  if (!actualConversationId) {
    // Create new conversation with placeholder title
    const placeholderTitle = userMessageText.slice(0, 50);
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        character_slug: characterSlug,
        title: placeholderTitle,
      })
      .select("id")
      .single();

    if (error) {
      return new Response("Failed to create conversation", { status: 500 });
    }

    actualConversationId = data.id;
    isNewConversation = true;
    currentTitle = placeholderTitle;
  } else {
    // Verify user owns this conversation and get current title
    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id, title")
      .eq("id", actualConversationId)
      .eq("user_id", user.id)
      .single();

    if (!existingConv) {
      return new Response("Conversation not found", { status: 404 });
    }
    currentTitle = existingConv.title ?? "";
  }

  // 5. Save the user message BEFORE streaming
  const { error: userMsgError } = await supabase.from("messages").insert({
    conversation_id: actualConversationId,
    role: "user",
    content: userMessageText,
  });

  if (userMsgError) {
    return new Response("Failed to save message", { status: 500 });
  }

  // 6. Stream response with AI SDK
  const result = streamText({
    model: openrouter(selectedModel),
    system: character.systemPrompt,
    messages,
    experimental_transform: smoothStream({
      delayInMs: 5,
      chunking: "word",
    }),
    onFinish: async ({ text }: { text: string }) => {
      // 7. Save assistant message AFTER streaming completes
      const { error: assistantMsgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: actualConversationId,
          role: "assistant",
          content: text,
        });

      if (assistantMsgError) {
        // Silent fail - message streaming already completed
      }

      // 8. Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", actualConversationId);

      // 9. Generate AI title for new conversations or if title is still generic
      // Title is considered "generic" if it's just the first 50 chars of user message
      const messageCount = messages.length;
      const isGenericTitle = currentTitle === userMessageText.slice(0, 50);
      const shouldGenerateTitle =
        isNewConversation || (messageCount <= 6 && isGenericTitle);

      if (shouldGenerateTitle) {
        // Fire and forget - don't await to avoid blocking response
        generateConversationTitle(
          actualConversationId,
          userMessageText,
          text
        ).catch(() => {
          // Silent fail - title generation is non-critical
        });
      }
    },
  });

  // 10. Return streaming response with conversation ID in header
  return result.toTextStreamResponse({
    headers: {
      "X-Conversation-Id": actualConversationId,
    },
  });
}
