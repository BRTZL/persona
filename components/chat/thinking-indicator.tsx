"use client";

import { Message } from "@/components/ui/message";

export function ThinkingIndicator() {
  return (
    <Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-6">
      <div className="text-muted-foreground flex items-center gap-2">
        <div className="flex gap-1">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
            ●
          </span>
          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
            ●
          </span>
          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
            ●
          </span>
        </div>
        <span className="text-sm">Thinking...</span>
      </div>
    </Message>
  );
}
