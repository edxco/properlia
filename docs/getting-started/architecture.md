# Properlia Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
└─────────────────────────────────────────────────────────────────┘
                 │                              │
                 │                              │
                 ▼                              ▼
        ┌────────────────┐            ┌────────────────┐
        │   domain.com   │            │app.domain.com  │
        │   (Frontend)   │            │   (Dashboard)  │
        │   Port 3001    │            │   Port 3002    │
        └────────────────┘            └────────────────┘
                 │                              │
                 │         ┌───────────┐        │
                 └────────▶│  Shared   │◀───────┘
                           │  Package  │
                           └───────────┘
                                  │
                                  ▼
                           ┌───────────┐
                           │ Rails API │
                           │ Port 3000 │
                           └───────────┘
                                  │
                                  ▼
                           ┌───────────┐
                           │ Database  │
                           └───────────┘
```

## Package Dependencies

```
┌──────────────────────────────────────────────────────────────┐
│                     packages/shared                          │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐         │
│  │ api-client │  │    types     │  │  services   │         │
│  │            │  │              │  │             │         │
│  │ - fetch    │  │ - Property   │  │ - propertyApi│         │
│  │ - error    │  │ - Status     │  │ - typeApi   │         │
│  │ - config   │  │ - DTOs       │  │             │         │
│  └────────────┘  └──────────────┘  └─────────────┘         │
└──────────────────────────────────────────────────────────────┘
                             ▲
                             │ imports from
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌─────────────┐    ┌─────────────┐      ┌─────────────┐
│  Frontend   │    │  Dashboard  │      │   Backend   │
│             │    │             │      │             │
│  Queries    │    │  Queries    │      │  Rails API  │
│  (READ)     │    │  Mutations  │      │             │
│             │    │  (CRUD)     │      │             │
└─────────────┘    └─────────────┘      └─────────────┘
```

## Data Flow

### Frontend (Public Site) - Read Only

```
User browses properties
         │
         ▼
┌─────────────────────┐
│  PropertyList.tsx   │
│  uses useProperties │
└─────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│  useProperties (Query Hook)   │
│  from frontend/src/services   │
└───────────────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│  propertyApi.getAll()         │
│  from @properlia/shared       │
└───────────────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│  apiClient()                  │
│  from @properlia/shared       │
└───────────────────────────────┘
         │
         ▼
    Rails API
    GET /api/v1/properties
```

### Dashboard (Admin Panel) - Full CRUD

```
Admin creates property
         │
         ▼
┌─────────────────────────┐
│  NewPropertyForm.tsx    │
│  uses useCreateProperty │
└─────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  useCreateProperty (Mutation)  │
│  from dashboard/src/services   │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  propertyApi.create(data)      │
│  from @properlia/shared        │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  apiClient()                   │
│  from @properlia/shared        │
└────────────────────────────────┘
         │
         ▼
    Rails API
    POST /api/v1/properties
         │
         ▼
┌────────────────────────────────┐
│  invalidateQueries(['props'])  │
│  (TanStack Query auto-refetch) │
└────────────────────────────────┘
```

## Service Layer Architecture

### Shared Package (Foundation)

```typescript
// packages/shared/src/services/properties/api.ts
export const propertyApi = {
  getAll: () => fetch('/properties'),
  create: (data) => fetch('/properties', { method: 'POST', body: data })
}
```

### Frontend Service Layer (Read-Only)

```typescript
// packages/frontend/src/services/properties/queries.ts
export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: propertyApi.getAll  // ← Uses shared
  })
}
```

### Dashboard Service Layer (Full CRUD)

```typescript
// packages/dashboard/src/services/properties/queries.ts
export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: propertyApi.getAll  // ← Uses shared
  })
}

// packages/dashboard/src/services/properties/mutations.ts
export const useCreateProperty = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: propertyApi.create,  // ← Uses shared
    onSuccess: () => {
      queryClient.invalidateQueries(['properties'])
    }
  })
}
```

## TypeScript Type Flow

```
┌────────────────────────────────┐
│  Backend (Rails)               │
│  models/property.rb            │
└────────────────────────────────┘
         │
         │ API Response
         ▼
┌────────────────────────────────┐
│  Shared Package                │
│  types/index.ts                │
│                                │
│  interface Property {          │
│    id: number;                 │
│    title: string;              │
│    price: number;              │
│  }                             │
└────────────────────────────────┘
         │
         ├──────────────┬─────────────┐
         ▼              ▼             ▼
    Frontend       Dashboard      Tests
   (uses type)   (uses type)   (uses type)
```

## Benefits

1. **Single Source of Truth**: Types defined once in shared package
2. **Code Reuse**: API functions used by both frontend and dashboard
3. **Type Safety**: TypeScript ensures data consistency
4. **Caching**: TanStack Query handles caching automatically
5. **Optimistic Updates**: Easy to implement in dashboard mutations
6. **Separation**: Public code separate from admin code

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel / Hosting                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐              ┌──────────────┐        │
│  │ domain.com   │              │app.domain.com│        │
│  │              │              │              │        │
│  │  Frontend    │              │  Dashboard   │        │
│  │  (Public)    │              │  (Protected) │        │
│  └──────────────┘              └──────────────┘        │
│         │                              │                │
└─────────┼──────────────────────────────┼────────────────┘
          │                              │
          └──────────────┬───────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  Rails API  │
                  │  (Backend)  │
                  └─────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  Database   │
                  └─────────────┘
```

## Security Considerations

- **Frontend**: Public access, read-only queries
- **Dashboard**: Requires authentication (add auth layer)
- **Shared Package**: No sensitive logic, only client-side utilities
- **API**: Backend handles all authentication and authorization

## Scalability

Easy to add:
- Mobile app (shares same `@properlia/shared`)
- Agent portal (new Next.js app)
- Public API docs (new Next.js app)
- Admin tools (extend dashboard)

All apps share the same types and API client!
