"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsage } from "@/queries";

export function UsageBanner() {
  const { data: usage, isLoading } = useUsage();

  if (isLoading || !usage) {
    return null;
  }

  const { message_count, daily_limit, remaining } = usage;
  const percentage = Math.min((message_count / daily_limit) * 100, 100);
  const isWarning = remaining <= 5 && remaining > 0;
  const isExhausted = remaining === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm",
        isExhausted
          ? "border-destructive/50 bg-destructive/10 text-destructive"
          : isWarning
            ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
            : "border-border bg-muted/50 text-muted-foreground"
      )}
    >
      <MessageCircle className="size-4 shrink-0" />

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            {isExhausted
              ? "Daily limit reached"
              : isWarning
                ? `${remaining} messages remaining`
                : "Daily usage"}
          </span>
          <span className="text-xs">
            {message_count}/{daily_limit}
          </span>
        </div>

        <div className="bg-background h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isExhausted
                ? "bg-destructive"
                : isWarning
                  ? "bg-yellow-500"
                  : "bg-primary"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {isExhausted && (
          <p className="text-xs">
            Your daily message limit resets at midnight UTC.
          </p>
        )}
      </div>
    </div>
  );
}
