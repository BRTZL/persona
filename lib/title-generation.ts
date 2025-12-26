import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

/**
 * Generates a conversation title using AI and updates the database.
 * This function is designed to be called fire-and-forget (no await).
 */
export async function generateConversationTitle(
  conversationId: string,
  userMessage: string,
  assistantResponse: string
): Promise<void> {
  try {
    // Use a fast/cheap model for title generation
    const { text } = await generateText({
      model: openrouter("google/gemini-2.0-flash-001"),
      system:
        "Generate a short, descriptive title (2-5 words) for this conversation. Return only the title, no quotes or punctuation at the end.",
      prompt: `User: ${userMessage}\nAssistant: ${assistantResponse.slice(0, 500)}`,
      temperature: 0.3,
      maxOutputTokens: 20,
    });

    const title = text.trim().slice(0, 50);

    if (!title) {
      console.warn("[title-generation] Empty title generated, skipping update");
      return;
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId);

    if (error) {
      console.error("[title-generation] Failed to update title:", error);
    } else {
      console.log("[title-generation] Title updated:", title);
    }
  } catch (error) {
    console.error("[title-generation] Error generating title:", error);
  }
}
