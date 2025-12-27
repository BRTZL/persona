import { createClient } from "@/lib/supabase/server";

export type UsageResponse = {
  message_count: number;
  daily_limit: number;
  remaining: number;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase.rpc("get_daily_message_usage", {
    p_user_id: user.id,
  });

  if (error) {
    console.error("Failed to get usage:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to get usage data",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // If no data, user hasn't sent any messages today
  const usage: UsageResponse =
    data && data.length > 0
      ? {
          message_count: data[0].message_count,
          daily_limit: data[0].daily_limit,
          remaining: data[0].remaining,
        }
      : {
          message_count: 0,
          daily_limit: 15,
          remaining: 15,
        };

  return new Response(JSON.stringify(usage), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
