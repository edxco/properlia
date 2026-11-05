# Properlia Monorepo Structure

This project uses a **monorepo architecture** with npm workspaces to manage multiple applications that share common code.

## Architecture Overview

```
properlia2025/
├── packages/
│   ├── frontend/          # Public site (domain.com) - Port 3001
│   ├── dashboard/         # Admin dashboard (app.domain.com) - Port 3002
│   ├── shared/            # Shared code library
│   └── backend/           # Ruby on Rails API
└── package.json           # Root workspace configuration
```

## Packages

### 1. Frontend (`packages/frontend`)
**URL**: domain.com
**Port**: 3001
**Purpose**: Public-facing website for property listings

**Structure**:
```
frontend/
├── app/[locale]/
│   ├── page.tsx                    # Home page
│   └── properties/
│       ├── page.tsx                # Property listings
│       └── [id]/page.tsx          # Property detail
├── src/
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── FeaturedProperties.tsx
│   │   └── ui/                    # UI components
│   └── providers/
│       └── QueryProvider.tsx      # TanStack Query provider
└── messages/                       # i18n translations
```

**Features**:
- Property browsing and search
- Property detail pages
- Multi-language support (EN/ES)
- Read-only TanStack Query hooks

### 2. Dashboard (`packages/dashboard`)
**URL**: app.domain.com
**Port**: 3002
**Purpose**: Admin panel for property management

**Structure**:
```
dashboard/
├── app/[locale]/
│   ├── layout.tsx                 # Root layout with QueryProvider
│   └── dashboard/
│       ├── layout.tsx             # Dashboard shell (header, nav)
│       ├── page.tsx               # Dashboard overview
│       └── properties/
│           ├── page.tsx           # Properties list with CRUD
│           ├── new/page.tsx       # Create property form
│           └── [id]/edit/page.tsx # Edit property form
└── src/
    ├── components/
    │   ├── dashboard/             # Dashboard-specific components
    │   └── properties/            # Property management UI
    ├── services/
    │   └── properties/
    │       ├── queries.ts         # Read queries
    │       └── mutations.ts       # Create/Update/Delete mutations
    └── providers/
        └── QueryProvider.tsx      # TanStack Query setup
```

**Features**:
- Property CRUD operations
- File upload for property images
- Analytics and reporting
- Full TanStack Query mutations

### 3. Shared (`packages/shared`)
**Purpose**: Common code shared between frontend and dashboard

**Structure**:
```
shared/
└── src/
    ├── index.ts                   # Main exports
    ├── lib/
    │   ├── api-client.ts         # Base fetch wrapper
    │   └── utils.ts              # Utility functions (cn, etc.)
    ├── services/
    │   ├── properties/
    │   │   └── api.ts            # Raw API functions
    │   └── property-types/
    │       └── api.ts
    └── types/
        └── index.ts              # TypeScript types
```

**What's Shared**:
- ✅ API client configuration
- ✅ TypeScript types (Property, PropertyType, etc.)
- ✅ Raw API functions (propertyApi.getAll, etc.)
- ✅ Utility functions
- ✅ UI components (can be added)

**What's NOT Shared**:
- ❌ TanStack Query hooks (different needs per app)
- ❌ Page components
- ❌ App-specific layouts

## Usage

### Installing Dependencies

From the root directory:
```bash
npm install
```

This installs dependencies for all packages in the workspace.

### Development

Run all apps:
```bash
npm run dev:all
```

Run specific apps:
```bash
npm run dev:frontend    # Start frontend on :3001
npm run dev:dashboard   # Start dashboard on :3002
```

### Building

Build all apps:
```bash
npm run build:all
```

Build specific apps:
```bash
npm run build:frontend
npm run build:dashboard
```

## Using Shared Code

### In Frontend or Dashboard

Import from the shared package:

```typescript
// Import types
import type { Property, CreatePropertyDto } from '@properlia/shared/types';

// Import API functions
import { propertyApi } from '@properlia/shared/services/properties/api';

// Import utilities
import { cn } from '@properlia/shared';
```

### Creating TanStack Query Hooks

**Dashboard** (with mutations):
```typescript
// packages/dashboard/src/services/properties/queries.ts
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '@properlia/shared/services/properties/api';

export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: propertyApi.getAll,
  });
};
```

```typescript
// packages/dashboard/src/services/properties/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '@properlia/shared/services/properties/api';

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};
```

**Frontend** (read-only):
```typescript
// packages/frontend/src/services/properties/queries.ts
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '@properlia/shared/services/properties/api';

export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: propertyApi.getAll,
  });
};
```

## Environment Variables

Create `.env.local` in each package:

**Frontend & Dashboard**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Deployment

### Option 1: Vercel (Recommended)

Deploy each app separately:

1. **Frontend**:
   - Root Directory: `packages/frontend`
   - Framework: Next.js
   - Domain: domain.com

2. **Dashboard**:
   - Root Directory: `packages/dashboard`
   - Framework: Next.js
   - Domain: app.domain.com

### Option 2: Docker

Build and deploy each app as separate containers.

## Benefits of This Architecture

1. **Code Reuse**: Share types, API clients, and utilities
2. **Independent Deployment**: Deploy frontend and dashboard separately
3. **Smaller Bundles**: Dashboard code doesn't ship to public users
4. **Type Safety**: Shared TypeScript types across apps
5. **Scalability**: Easy to add new apps (mobile, admin, etc.)
6. **Separation of Concerns**: Clear boundaries between public and private code

## Adding New Shared Code

1. Add code to `packages/shared/src/`
2. Export from `packages/shared/src/index.ts` (optional)
3. Use in frontend or dashboard with `@properlia/shared`

Example - Adding a new API service:

```typescript
// packages/shared/src/services/users/api.ts
import { apiClient } from '../../lib/api-client';

export const userApi = {
  getAll: async () => apiClient('/users'),
  getById: async (id: number) => apiClient(\`/users/\${id}\`),
};
```

Then use in dashboard:
```typescript
// packages/dashboard/src/services/users/queries.ts
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@properlia/shared/services/users/api';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
  });
};
```

## Troubleshooting

### TypeScript can't find shared package

Make sure TypeScript paths are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@properlia/shared": ["../shared/src/index.ts"],
      "@properlia/shared/*": ["../shared/src/*"]
    }
  }
}
```

### Module not found errors

Run `npm install` from the root directory to link workspace packages.

### Changes in shared package not reflecting

Restart the Next.js dev server after making changes to the shared package.
