import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";

const PERSISTED_QUERY_KEYS = ["favorite-characters", "chat"] as const;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
      dehydrate: {
        shouldDehydrateQuery: (query) => {
          if (!defaultShouldDehydrateQuery(query)) return false;
          const queryKey = query.queryKey;
          if (!Array.isArray(queryKey) || queryKey.length === 0) return false;
          const rootKey = queryKey[0];
          return PERSISTED_QUERY_KEYS.includes(
            rootKey as (typeof PERSISTED_QUERY_KEYS)[number]
          );
        },
      },
    },
  });
}
