# Quick Start Guide

## What We Built

Your project now has a **monorepo structure** with 3 packages:

1. **Frontend** (domain.com) - Public property listing site
2. **Dashboard** (app.domain.com) - Admin property management
3. **Shared** - Common code library

## File Structure

```
packages/
├── frontend/              # Port 3001 - Public site
│   ├── app/[locale]/
│   ├── src/
│   │   ├── components/
│   │   ├── services/properties/queries.ts
│   │   └── providers/QueryProvider.tsx
│   └── package.json
│
├── dashboard/             # Port 3002 - Admin dashboard
│   ├── app/[locale]/
│   │   └── dashboard/
│   │       ├── page.tsx                    # Dashboard home
│   │       └── properties/page.tsx         # Properties management
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── properties/
│   │   │       ├── queries.ts              # Read operations
│   │   │       └── mutations.ts            # Create/Update/Delete
│   │   └── providers/QueryProvider.tsx
│   └── package.json
│
└── shared/                # Shared library
    ├── src/
    │   ├── lib/
    │   │   ├── api-client.ts               # Fetch wrapper
    │   │   └── utils.ts                    # Utilities
    │   ├── services/
    │   │   └── properties/api.ts           # Raw API functions
    │   └── types/index.ts                  # TypeScript types
    └── package.json
```

## Running the Apps

### Install Dependencies
```bash
cd /Users/eduardobaeza/Documents/properlia2025
npm install
```

### Start Frontend (Public Site)
```bash
npm run dev:frontend
```
Visit: http://localhost:3001

### Start Dashboard (Admin Panel)
```bash
npm run dev:dashboard
```
Visit: http://localhost:3002/dashboard

### Start Both
```bash
npm run dev:all
```

## How to Use Shared Code

### Example 1: Using Types
```typescript
import type { Property, CreatePropertyDto } from '@properlia/shared/types';

const property: Property = {
  id: 1,
  title: "Beautiful House",
  price: 500000,
  // ... other fields
};
```

### Example 2: Using API Functions (in Dashboard)
```typescript
// packages/dashboard/app/[locale]/dashboard/properties/new/page.tsx
'use client';

import { useCreateProperty } from '@/src/services/properties/mutations';
import type { CreatePropertyDto } from '@properlia/shared/types';

export default function NewPropertyPage() {
  const createProperty = useCreateProperty();

  const handleSubmit = async (data: CreatePropertyDto) => {
    await createProperty.mutateAsync(data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Example 3: Using API Functions (in Frontend)
```typescript
// packages/frontend/app/[locale]/properties/page.tsx
'use client';

import { useProperties } from '@/src/services/properties/queries';

export default function PropertiesPage() {
  const { data: properties, isLoading } = useProperties();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {properties?.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

## Key Concepts

### Service Layer Pattern

**Shared Package** - Raw API calls only:
```typescript
// packages/shared/src/services/properties/api.ts
export const propertyApi = {
  getAll: () => apiClient<Property[]>('/properties'),
  create: (data) => apiClient<Property>('/properties', { method: 'POST', body: JSON.stringify(data) }),
};
```

**Frontend/Dashboard** - TanStack Query hooks:
```typescript
// packages/dashboard/src/services/properties/queries.ts
export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: propertyApi.getAll,  // Uses shared API function
  });
};
```

### Why This Structure?

1. **Code Reuse**: Types and API functions shared across apps
2. **Separation**: Dashboard has mutations, frontend is read-only
3. **Type Safety**: TypeScript ensures consistency
4. **Independent Deploy**: Each app deploys separately
5. **Smaller Bundles**: Dashboard code doesn't go to public users

## Environment Setup

Create `.env.local` in each package:

**packages/frontend/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

**packages/dashboard/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Next Steps

1. **Start the backend**: Make sure your Rails API is running on port 3000
2. **Test the dashboard**: Go to http://localhost:3002/dashboard/properties
3. **Customize the frontend**: Edit `packages/frontend/app/[locale]/page.tsx`
4. **Add property forms**: Create forms in dashboard for CRUD operations
5. **Add authentication**: Protect dashboard routes

## Deployment

### Frontend (domain.com)
- Deploy `packages/frontend` to Vercel
- Set domain to domain.com

### Dashboard (app.domain.com)
- Deploy `packages/dashboard` to Vercel
- Set domain to app.domain.com

Both apps share the same backend API.

## Troubleshooting

**"Module not found @properlia/shared"**
- Run `npm install` from root directory
- Restart Next.js dev server

**TypeScript errors with shared imports**
- Check `tsconfig.json` has correct path mappings
- Run `npm install` again

**Changes in shared package not reflecting**
- Restart the dev server for frontend/dashboard

## More Information

See [MONOREPO_STRUCTURE.md](./MONOREPO_STRUCTURE.md) for detailed documentation.
