"use client";

import { MessageCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsageStats } from "@/queries";

export default function UsagePage() {
  const { data: usageStats, isLoading: isUsageLoading } = useUsageStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-medium">Usage</h2>
        <p className="text-muted-foreground text-sm">
          Your message usage statistics
        </p>
      </div>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <MessageCircle className="text-primary size-4" />
            </div>
            <div>
              <CardTitle>Message Usage</CardTitle>
              <CardDescription>Track your daily message limits</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isUsageLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : usageStats ? (
            <div className="space-y-6">
              {/* Today's Usage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-medium">
                    {usageStats.today_count} / {usageStats.daily_limit} messages
                  </span>
                </div>
                <Progress
                  value={
                    (usageStats.today_count / usageStats.daily_limit) * 100
                  }
                  className="h-2"
                />
                <p className="text-muted-foreground text-xs">
                  {usageStats.daily_limit - usageStats.today_count} messages
                  remaining today
                </p>
              </div>

              {/* Weekly & Monthly Stats */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Last 7 days
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {usageStats.week_count}
                  </p>
                  <p className="text-muted-foreground text-xs">messages sent</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    Last 30 days
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {usageStats.month_count}
                  </p>
                  <p className="text-muted-foreground text-xs">messages sent</p>
                </div>
              </div>

              <p className="text-muted-foreground text-xs">
                Daily limit resets at midnight UTC
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
