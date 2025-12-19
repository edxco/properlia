# Docker Setup - Issue Resolution Summary

## Problem Overview

The Docker development environment was failing to start with multiple errors related to native module compatibility and node_modules installation issues.

## Root Causes Identified

### 1. Alpine vs Debian Compatibility
- **Issue**: Tailwind CSS v4 uses `lightningcss` which has native Node.js bindings
- **Problem**: Alpine Linux uses `musl` libc, but `lightningcss` requires `glibc` (Debian)
- **Error**: `Cannot find module '../lightningcss.linux-x64-musl.node'`

### 2. Node Modules Installation Conflicts
- **Issue**: Attempting to use locally installed node_modules with Docker containers
- **Problem**: Host machine Node version (v19.1.0) incompatible with Next.js 16 requirement (>=20.9.0)
- **Error**: `EEXIST: file already exists, symlink` when npm tried to create workspace links

### 3. Volume Mount Strategy
- **Issue**: node_modules from host being mounted into containers
- **Problem**: Created conflicts between host and container module installations

## Solutions Implemented

### ✅ 1. Switch from Alpine to Debian Images

**Changed in [docker-compose.yml](docker-compose.yml):**
```yaml
# Before
image: node:20-alpine

# After
image: node:20-slim
```

**Benefits:**
- Compatible with `lightningcss` native bindings
- Still optimized (~200MB vs ~1.1GB for full node:20)
- Works with all native Node.js modules

**Also updated:**
- [packages/frontend/Dockerfile](packages/frontend/Dockerfile)
- [packages/dashboard/Dockerfile](packages/dashboard/Dockerfile)

### ✅ 2. Anonymous Volume Mounts for node_modules

**Changed in [docker-compose.yml](docker-compose.yml):**
```yaml
volumes:
  - .:/monorepo
  # Anonymous volumes to prevent host node_modules from being mounted
  - /monorepo/node_modules
  - /monorepo/packages/frontend/node_modules
  - /monorepo/packages/dashboard/node_modules
  - /monorepo/packages/shared/node_modules
```

**Benefits:**
- Each container maintains its own node_modules
- Prevents conflicts with host-installed modules
- Ensures correct Node version (20.19.6) is used

### ✅ 3. Simplified npm ci Command

**Changed in [docker-compose.yml](docker-compose.yml):**
```yaml
# Before (had conditionals and fallbacks)
command: bash -c "[ ! -d node_modules ] && npm ci || true && cd packages/frontend && npm run dev"

# After (clean and simple)
command: bash -c "npm ci && cd packages/frontend && npm run dev"
```

**Benefits:**
- Always fresh install on container start
- No conditional logic that could hide errors
- Clear error messages if installation fails

### ✅ 4. Removed Local node_modules

**Executed:**
```bash
rm -rf node_modules packages/*/node_modules packages/*/.next
```

**Benefits:**
- Eliminates host/container conflicts
- Forces clean installation in Docker
- Prevents version mismatches

## Current Status

### All Services Running Successfully ✅

```
NAME                        STATUS                   PORTS
properlia2025-backend-1     Up 2 minutes             0.0.0.0:3000->3000/tcp
properlia2025-dashboard-1   Up 2 minutes             0.0.0.0:3002->3002/tcp
properlia2025-db-1          Up 3 minutes (healthy)   0.0.0.0:5432->5432/tcp
properlia2025-frontend-1    Up 2 minutes             0.0.0.0:3001->3001/tcp
```

### Service Details

#### Frontend ✅
- URL: http://localhost:3001
- Status: Ready in 18.2s
- Next.js: 16.0.3 (Turbopack)
- Node: v20.19.6

#### Dashboard ✅
- URL: http://localhost:3002
- Status: Ready in 16.9s
- Next.js: 16.0.3 (Turbopack)
- Node: v20.19.6

#### Backend ✅
- URL: http://localhost:3000
- Status: Running
- Rails API ready

#### Database ✅
- Port: 5432
- Status: Healthy
- PostgreSQL: 15

## What Changed in Files

### [docker-compose.yml](docker-compose.yml)
1. Changed `image: node:20-alpine` → `image: node:20-slim` (frontend & dashboard)
2. Added anonymous volume mounts for all node_modules directories
3. Simplified commands to use `bash` instead of `sh`
4. Removed conditional npm ci logic

### [packages/frontend/Dockerfile](packages/frontend/Dockerfile)
1. Changed `FROM node:20-alpine` → `FROM node:20-slim` (all stages)

### [packages/dashboard/Dockerfile](packages/dashboard/Dockerfile)
1. Changed `FROM node:20-alpine` → `FROM node:20-slim` (all stages)

### [packages/dashboard/app/globals.css](packages/dashboard/app/globals.css)
1. Created file with `@import "tailwindcss";` (was missing)

## Testing the Setup

### 1. Start Services
```bash
docker-compose up -d
```

### 2. Check Status
```bash
docker-compose ps
```

### 3. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f dashboard
docker-compose logs -f backend
```

### 4. Access Services
- Frontend: http://localhost:3001
- Dashboard: http://localhost:3002
- Backend API: http://localhost:3000/api/v1/properties

## Key Learnings

### 1. Alpine vs Debian Trade-offs

**When to use Alpine:**
- Pure JavaScript projects
- No native Node.js modules
- Smallest possible image size is critical

**When to use Debian (node:slim):**
- Projects with native modules (like lightningcss, canvas, sharp, etc.)
- Better compatibility with npm ecosystem
- Still reasonably small (~200MB)

### 2. Docker Volume Strategy

**For Development:**
- Mount source code: `./packages/frontend:/monorepo/packages/frontend`
- Use anonymous volumes for node_modules: `/monorepo/node_modules`
- Let containers manage their own dependencies

**Why:**
- Prevents host/container OS conflicts
- Ensures consistent Node version usage
- Faster container startups (cached dependencies)

### 3. Monorepo Considerations

**Build Context:**
- Always build from root for packages that need shared code
- Use `.dockerignore` at both root and package levels
- Multi-stage builds to minimize final image size

**Workspace Setup:**
- Use anonymous volumes for each workspace package's node_modules
- Let npm workspace handle package linking inside container
- Don't try to share node_modules between host and container

## Future Improvements

### Optional Enhancements

1. **Cache npm packages between builds:**
   ```yaml
   volumes:
     - npm_cache:/root/.npm
   ```

2. **Remove duplicate package-lock.json files:**
   - Keep only root `package-lock.json`
   - Remove `packages/frontend/package-lock.json`
   - Remove `packages/dashboard/package-lock.json`
   - This will silence Next.js workspace root warning

3. **Add health checks for frontend/dashboard:**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3001"]
     interval: 30s
     timeout: 5s
     retries: 3
   ```

4. **Production optimization:**
   - Already using multi-stage builds ✓
   - Already using standalone Next.js output ✓
   - Could add distroless final stage for even smaller images

## Related Documentation

- [DOCKER_LIGHTNINGCSS_FIX.md](DOCKER_LIGHTNINGCSS_FIX.md) - Detailed explanation of Alpine vs Debian issue
- [DOCKER.md](DOCKER.md) - Complete Docker setup guide
- [DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md) - Quick command reference
- [MONOREPO_STRUCTURE.md](MONOREPO_STRUCTURE.md) - Monorepo architecture

## Summary

The Docker environment is now fully functional with all services running correctly. The key fixes were:

1. ✅ Switched to Debian-based images for native module compatibility
2. ✅ Implemented anonymous volume mounts for node_modules isolation
3. ✅ Simplified container commands for clarity and reliability
4. ✅ Removed host node_modules to eliminate conflicts

All services are accessible and ready for development work.
