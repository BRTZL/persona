import { createClient } from "@/lib/supabase/server";

export type UsageStatsResponse = {
  today_count: number;
  week_count: number;
  month_count: number;
  daily_limit: number;
};

const DAILY_LIMIT = 15;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get date boundaries
  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Query all messages from last 30 days (RLS ensures user only sees their own)
  const { data, error } = await supabase
    .from("message_usage_log")
    .select("created_at")
    .gte("created_at", monthAgo.toISOString());

  if (error) {
    console.error("Failed to get usage stats:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to get usage stats",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Count messages by time period
  let todayCount = 0;
  let weekCount = 0;
  const monthCount = data?.length ?? 0;

  for (const row of data ?? []) {
    const createdAt = new Date(row.created_at);
    if (createdAt >= todayStart) {
      todayCount++;
    }
    if (createdAt >= weekAgo) {
      weekCount++;
    }
  }

  const stats: UsageStatsResponse = {
    today_count: todayCount,
    week_count: weekCount,
    month_count: monthCount,
    daily_limit: DAILY_LIMIT,
  };

  return new Response(JSON.stringify(stats), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
