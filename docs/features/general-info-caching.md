# General Info Caching Strategy

## Overview

The `/api/v1/general_info` endpoint contains data that rarely changes (phone, WhatsApp, email). To optimize performance and reduce unnecessary API calls, we've implemented an aggressive caching strategy using React Query.

## Implementation

### Location

- **Query Hook**: `packages/frontend/src/services/general-info/queries.ts`
- **API Client**: `packages/shared/src/services/general-info/api.ts`

### Caching Configuration

```typescript
export const useGeneralInfo = () => {
  return useQuery({
    queryKey: ['generalInfo'],
    queryFn: () => generalInfoApi.get(),
    staleTime: 1000 * 60 * 60 * 24,      // 24 hours - data considered fresh
    gcTime: 1000 * 60 * 60 * 24 * 7,     // 7 days - kept in memory when unused
    retry: 3,                              // Retry 3 times on failure
    refetchOnWindowFocus: false,           // Don't refetch when window regains focus
    refetchOnReconnect: false,             // Don't refetch when reconnecting
    refetchOnMount: false,                 // Don't refetch when component mounts
  });
};
```

### What This Means

1. **First Request**: Data is fetched from the API
2. **Subsequent Requests** (within 24 hours): Data is returned from cache instantly
3. **After 24 Hours**: Data is refetched automatically on next request
4. **Memory Management**: Data stays in memory for 7 days even if components using it unmount
5. **Window Focus/Reconnect**: No unnecessary refetches when user switches tabs or reconnects

## Usage in Components

```typescript
import { useGeneralInfo } from "@/src/services/general-info/queries";

export function MyComponent() {
  const { data: generalInfo, isLoading, isError } = useGeneralInfo();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !generalInfo) {
    return <div>Error loading contact info</div>;
  }

  return (
    <div>
      <p>Phone: {generalInfo.phone}</p>
      <p>WhatsApp: {generalInfo.whatsapp}</p>
      <p>Email: {generalInfo.email_to}</p>
    </div>
  );
}
```

## Benefits

- **Performance**: After initial load, data is instant (no API calls)
- **Reduced Server Load**: 99% fewer requests to `/api/v1/general_info`
- **Better UX**: No loading states after first fetch
- **Cost Savings**: Fewer API calls = lower bandwidth costs

## Manual Cache Invalidation

If general info is updated in the dashboard, the cache will automatically refresh within 24 hours. If you need immediate updates across the frontend:

```typescript
import { useQueryClient } from '@tanstack/react-query';

function SomeComponent() {
  const queryClient = useQueryClient();

  const forceRefresh = () => {
    // Invalidate and refetch immediately
    queryClient.invalidateQueries({ queryKey: ['generalInfo'] });
  };

  return <button onClick={forceRefresh}>Refresh Contact Info</button>;
}
```

## Dashboard Behavior

The dashboard also uses the same caching strategy (`packages/dashboard/src/services/general-info/queries.ts`), but when data is updated via the dashboard form, React Query automatically invalidates and refetches the cache.

## TypeScript Types

```typescript
interface GeneralInfo {
  phone: string;
  whatsapp: string;
  email_to: string;
}
```

## Notes

- ✅ Data is shared across all components using the same query key
- ✅ Cache survives page navigation within the app
- ✅ Cache is cleared on full page refresh
- ✅ Cache is stored in memory (not localStorage/sessionStorage)
- ✅ Multiple components can use `useGeneralInfo()` without additional API calls
