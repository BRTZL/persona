import { NextResponse } from "next/server";
import { z } from "zod";
import { getCharacter, isValidCharacterSlug } from "@/lib/characters";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1),
  characterSlug: z.string(),
  conversationId: z.uuid().optional(),
  history: z.array(MessageSchema).optional().default([]),
  model: z.string().optional(),
});

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterResponse = {
  choices: Array<{
    message: {
      role: "assistant";
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
};

export async function POST(request: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, characterSlug, conversationId, history, model } =
      parsed.data;

    if (!isValidCharacterSlug(characterSlug)) {
      return NextResponse.json(
        { error: "Invalid character slug" },
        { status: 400 }
      );
    }

    const character = getCharacter(characterSlug);
    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    let actualConversationId = conversationId;

    // If no conversationId, create a new conversation
    if (!actualConversationId) {
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          character_slug: characterSlug,
          title: message.slice(0, 50),
        })
        .select("id")
        .single();

      if (createError) {
        console.error("Failed to create conversation:", createError);
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 }
        );
      }

      actualConversationId = newConversation.id;
    } else if (conversationId) {
      // Verify user owns this conversation
      const { data: existingConversation, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !existingConversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    }

    // Save user message
    const { data: savedUserMessage, error: userMsgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: actualConversationId,
        role: "user",
        content: message,
      })
      .select("id, role, content")
      .single();

    if (userMsgError) {
      console.error("Failed to save user message:", userMsgError);
      return NextResponse.json(
        { error: "Failed to save message" },
        { status: 500 }
      );
    }

    // Build messages array for LLM
    const llmMessages: OpenRouterMessage[] = [
      {
        role: "system",
        content: character.systemPrompt,
      },
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    // Call OpenRouter API
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": env.NEXT_PUBLIC_APP_URL,
          "X-Title": "Persona AI",
        },
        body: JSON.stringify({
          model: model ?? DEFAULT_MODEL,
          messages: llmMessages,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const data = (await response.json()) as OpenRouterResponse;

    if (data.error) {
      console.error("OpenRouter error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const assistantContent = data.choices[0]?.message?.content;

    if (!assistantContent) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Save assistant message
    const { data: savedAssistantMessage, error: assistantMsgError } =
      await supabase
        .from("messages")
        .insert({
          conversation_id: actualConversationId,
          role: "assistant",
          content: assistantContent,
        })
        .select("id, role, content")
        .single();

    if (assistantMsgError) {
      console.error("Failed to save assistant message:", assistantMsgError);
      return NextResponse.json(
        { error: "Failed to save response" },
        { status: 500 }
      );
    }

    // Update conversation's updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", actualConversationId);

    return NextResponse.json({
      conversationId: actualConversationId,
      userMessage: savedUserMessage,
      assistantMessage: savedAssistantMessage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
