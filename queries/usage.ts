import { queryOptions, useQuery } from "@tanstack/react-query";
import type { UsageResponse } from "@/app/api/usage/route";

export const usageKeys = {
  all: ["usage"] as const,
  daily: () => ["usage", "daily"] as const,
};

export function usageQueryOptions() {
  return queryOptions({
    queryKey: usageKeys.daily(),
    queryFn: async (): Promise<UsageResponse> => {
      const response = await fetch("/api/usage");

      if (!response.ok) {
        throw new Error("Failed to fetch usage data");
      }

      return response.json();
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export function useUsage() {
  return useQuery(usageQueryOptions());
}
