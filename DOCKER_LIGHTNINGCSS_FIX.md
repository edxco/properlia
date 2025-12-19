# LightningCSS Docker Fix

## Problem

The error you encountered:
```
Error: Cannot find module '../lightningcss.linux-x64-musl.node'
```

This happens because:
1. **Alpine Linux** uses `musl` libc instead of `glibc`
2. **Tailwind CSS v4** uses `lightningcss` which has native bindings
3. The Alpine-based image (`node:20-alpine`) doesn't have the correct native bindings

## Solution

Changed from **Alpine** to **Debian-based** Node images:

```diff
# Before
- FROM node:20-alpine

# After
+ FROM node:20-slim
```

## What Changed

### Development (docker-compose.yml)
- Frontend: `node:20-alpine` → `node:20-slim`
- Dashboard: `node:20-alpine` → `node:20-slim`
- Command: `sh` → `bash`

### Production Dockerfiles
- [packages/frontend/Dockerfile](packages/frontend/Dockerfile)
- [packages/dashboard/Dockerfile](packages/dashboard/Dockerfile)

Both now use `node:20-slim` instead of `node:20-alpine`.

## Why node:20-slim?

**node:20-slim** is a Debian-based image that:
- ✅ Has `glibc` (compatible with `lightningcss` bindings)
- ✅ Still smaller than full `node:20` (~200MB vs ~1GB)
- ✅ Works with all native Node.js modules
- ✅ Uses `bash` instead of `sh`

## How to Apply the Fix

### 1. Clean Up Old Containers

```bash
# Stop all services
docker-compose down

# Remove volumes (to clear old node_modules)
docker-compose down -v
```

### 2. Restart Services

```bash
# Start fresh
docker-compose up

# Or rebuild and start
docker-compose up --build
```

The new images will download automatically and install the correct native bindings.

## Verifying the Fix

After restarting, you should see:
1. Frontend running on http://localhost:3001 ✅
2. Dashboard running on http://localhost:3002 ✅
3. No `lightningcss` errors ✅

Check logs:
```bash
docker-compose logs -f frontend
docker-compose logs -f dashboard
```

You should see:
```
✓ Ready in [time]
○ Local:    http://localhost:3001
```

## Image Size Comparison

```
┌──────────────────┬─────────┬────────────┐
│ Image            │ Size    │ libc       │
├──────────────────┼─────────┼────────────┤
│ node:20          │ ~1.1 GB │ glibc ✅   │
│ node:20-slim     │ ~200 MB │ glibc ✅   │
│ node:20-alpine   │ ~130 MB │ musl ❌    │
└──────────────────┴─────────┴────────────┘
```

**node:20-slim** is the sweet spot:
- Smaller than full Node image
- Compatible with native modules
- Works with Tailwind CSS v4

## Alternative Solutions (Not Recommended)

### Option 1: Use Alpine with Build Tools
```dockerfile
FROM node:20-alpine
RUN apk add --no-cache python3 make g++
```
**Issue**: Increases image size, slower builds

### Option 2: Downgrade Tailwind CSS
```bash
npm install tailwindcss@3
```
**Issue**: Loses Tailwind v4 features

### Option 3: Use Different CSS Framework
**Issue**: Major refactor required

## Recommendation

✅ **Stick with node:20-slim** - Best balance of size and compatibility.

## Future Considerations

If you want to optimize further in production, you could:
1. Use multi-stage builds (already implemented ✅)
2. Use distroless images for the runner stage
3. Pre-compile CSS during build

But for now, **node:20-slim** is the best choice.

## Summary

- ✅ Changed from Alpine to Debian-based images
- ✅ Fixed lightningcss native module compatibility
- ✅ Still using optimized slim images (~200MB)
- ✅ Works with Tailwind CSS v4
- ✅ No code changes required

Just restart your containers and everything should work!
