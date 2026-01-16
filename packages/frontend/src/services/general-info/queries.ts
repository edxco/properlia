'use client';

import { useQuery } from '@tanstack/react-query';
import { generalInfoApi } from '@properlia/shared/services/general-info/api';

/**
 * Hook to fetch general info data with aggressive caching
 * This data rarely changes, so we set a very long stale time
 */
export const useGeneralInfo = () => {
  return useQuery({
    queryKey: ['generalInfo'],
    queryFn: () => generalInfoApi.get(),
    // Cache for 24 hours (data rarely changes)
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    // Keep in cache for 7 days even when unused
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    // Retry failed requests
    retry: 3,
    // Don't refetch on window focus since data is static
    refetchOnWindowFocus: false,
    // Don't refetch on reconnect
    refetchOnReconnect: false,
    // Don't refetch on mount if data exists
    refetchOnMount: false,
  });
};
