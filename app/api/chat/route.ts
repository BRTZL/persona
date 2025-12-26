import { NextResponse } from "next/server";
import { z } from "zod";
import { getCharacter, isValidCharacterSlug } from "@/lib/characters";
import { env } from "@/lib/env";

const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1),
  characterSlug: z.string(),
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
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, characterSlug, history, model } = parsed.data;

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

    // Build messages array with system prompt and history
    const messages: OpenRouterMessage[] = [
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
          messages,
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

    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      role: "assistant",
      content: assistantMessage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
