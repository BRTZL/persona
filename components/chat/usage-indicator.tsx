"use client";

import { MessageCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useUsage } from "@/queries";

type UsageIndicatorProps = {
  variant: "sidebar" | "header";
};

export function UsageIndicator({ variant }: UsageIndicatorProps) {
  const { data: usage, isLoading } = useUsage();

  if (isLoading || !usage) {
    return null;
  }

  const { message_count, daily_limit, remaining } = usage;
  const percentage = Math.min((message_count / daily_limit) * 100, 100);
  const isWarning = remaining <= 5 && remaining > 0;
  const isExhausted = remaining === 0;

  if (variant === "header") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              isExhausted
                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                : isWarning
                  ? "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-400"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <MessageCircle className="size-3" />
            <span>
              {remaining}/{daily_limit}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="w-64">
          <div className="space-y-3">
            <div>
              <p className="font-medium">
                {isExhausted
                  ? "Daily limit reached"
                  : `${remaining} of ${daily_limit} messages remaining`}
              </p>
              <p className="text-muted-foreground text-sm">
                {isExhausted
                  ? "Your limit resets at midnight UTC."
                  : `You can send ${daily_limit} messages per day.`}
              </p>
            </div>
            <Progress
              value={percentage}
              className={cn(
                "h-2",
                isExhausted
                  ? "[&>div]:bg-destructive"
                  : isWarning
                    ? "[&>div]:bg-yellow-500"
                    : ""
              )}
            />
            <p className="text-muted-foreground text-xs">
              Resets at midnight UTC
            </p>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Sidebar variant
  return (
    <div className="space-y-2 px-2 py-3">
      <div className="flex items-center justify-between text-xs">
        <span
          className={cn(
            "font-medium",
            isExhausted
              ? "text-destructive"
              : isWarning
                ? "text-yellow-700 dark:text-yellow-400"
                : "text-muted-foreground"
          )}
        >
          {isExhausted
            ? "Daily limit reached"
            : isWarning
              ? `${remaining} messages left`
              : "Daily messages"}
        </span>
        <span className="text-muted-foreground">
          {message_count}/{daily_limit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          "h-1.5",
          isExhausted
            ? "[&>div]:bg-destructive"
            : isWarning
              ? "[&>div]:bg-yellow-500"
              : ""
        )}
      />
      {isExhausted && (
        <p className="text-muted-foreground text-[10px]">
          Resets at midnight UTC
        </p>
      )}
    </div>
  );
}
