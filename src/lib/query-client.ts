import { QueryClient } from "@tanstack/react-query";

/**
 * Single production-grade QueryClient:
 * - Longer staleTime reduces redundant GETs (rate limits, server load).
 * - refetchOnWindowFocus still refreshes stale data when the user returns to the tab.
 * - gcTime keeps inactive cache for back/forward navigation.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 min — public catalog data stays fresh enough
        gcTime: 1000 * 60 * 30, // 30 min garbage collection (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  });
}
