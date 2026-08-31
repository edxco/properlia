# Docker Setup Complete! 🐳

The Properlia monorepo is now fully configured for Docker.

## What's Been Set Up

### ✅ Dockerfiles
- [packages/frontend/Dockerfile](packages/frontend/Dockerfile) - Multi-stage build with monorepo support
- [packages/dashboard/Dockerfile](packages/dashboard/Dockerfile) - Multi-stage build with monorepo support
- [packages/backend/Dockerfile](packages/backend/Dockerfile) - Rails API (already existed)

### ✅ Docker Compose Files
- [docker-compose.yml](docker-compose.yml) - Development with hot reload
- [docker-compose.stage.yml](docker-compose.stage.yml) - Staging environment
- [docker-compose.prod.yml](docker-compose.prod.yml) - Production deployment

### ✅ Build Tools
- [docker-build.sh](docker-build.sh) - Automated build script
- [Makefile](Makefile) - Convenient make commands

### ✅ Configuration Files
- [.dockerignore](.dockerignore) - Root ignore patterns
- [packages/frontend/.dockerignore](packages/frontend/.dockerignore)
- [packages/dashboard/.dockerignore](packages/dashboard/.dockerignore)

### ✅ Documentation
- [DOCKER.md](DOCKER.md) - Complete Docker guide
- [DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md) - Quick command reference

### ✅ Next.js Configuration
- Frontend: `output: "standalone"` ✓
- Dashboard: `output: "standalone"` ✓

## Quick Start

### Development (Recommended for Local Work)

```bash
# Start everything
docker-compose up

# Or run in background
docker-compose up -d

# Access services
# - Backend:   http://localhost:3000
# - Frontend:  http://localhost:3001
# - Dashboard: http://localhost:3002
```

### Production

```bash
# 1. Build images
./docker-build.sh

# 2. Start services
docker-compose -f docker-compose.prod.yml up -d
```

## Key Features

### Monorepo Support ✓
Both frontend and dashboard Dockerfiles:
- Build from root directory (access to shared package)
- Multi-stage builds for optimal image size
- Standalone Next.js output
- Shared code properly included

### Development Experience ✓
- Hot reload for all Next.js apps
- Volume mounts for instant updates
- Cached node_modules for faster startups
- Logs accessible via `docker-compose logs -f`

### Production Ready ✓
- Optimized multi-stage builds
- Minimal image sizes with standalone output
- Environment variable support
- Health checks included
- Separate staging and production configs

## File Structure

```
properlia2025/
├── docker-compose.yml              # Development
├── docker-compose.stage.yml        # Staging
├── docker-compose.prod.yml         # Production
├── docker-build.sh                 # Build script
├── Makefile                        # Make commands
├── .dockerignore                   # Root ignore
├── DOCKER.md                       # Full documentation
├── DOCKER_QUICK_REFERENCE.md       # Quick reference
│
└── packages/
    ├── frontend/
    │   ├── Dockerfile              # Multi-stage, monorepo-aware
    │   ├── .dockerignore
    │   └── next.config.js          # output: "standalone" ✓
    │
    ├── dashboard/
    │   ├── Dockerfile              # Multi-stage, monorepo-aware
    │   ├── .dockerignore
    │   └── next.config.ts          # output: "standalone" ✓
    │
    ├── backend/
    │   └── Dockerfile              # Rails API
    │
    └── shared/                     # Included in frontend/dashboard builds
```

## Important: Build Context

⚠️ **Frontend and Dashboard must be built from the root directory:**

```bash
# ✅ Correct (from root)
docker build -t properlia-frontend:latest -f packages/frontend/Dockerfile .

# ❌ Wrong (from packages/frontend)
cd packages/frontend
docker build -t properlia-frontend:latest .
```

**Why?** Both apps need access to `packages/shared/`

## Services

### Database (PostgreSQL 15)
- Port: 5432
- User: postgres
- Password: postgres (dev)
- Database: properlia2025_development

### Backend (Rails API)
- Port: 3000
- Environment: development
- Hot reload: ✓ (volume mounted)

### Frontend (Public Site)
- Port: 3001
- Shared package: ✓
- Hot reload: ✓ (volume mounted)
- TanStack Query: ✓

### Dashboard (Admin Panel)
- Port: 3002
- Shared package: ✓
- Hot reload: ✓ (volume mounted)
- TanStack Query: ✓

## Common Commands

```bash
# Development
make dev              # Start all services
make dev-logs         # View logs
make dev-down         # Stop services

# Production
./docker-build.sh     # Build images
make prod-up          # Start production
make prod-down        # Stop production

# Database
make db-migrate       # Run migrations
make db-seed          # Seed database
make db-reset         # Reset database

# Utilities
make shell-backend    # Rails console
make shell-frontend   # Frontend shell
make shell-dashboard  # Dashboard shell
make ps               # Show containers
make clean            # Remove everything
```

## Environment Variables

Create `.env` in root directory:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=properlia2025_development

# Backend
DEVISE_JWT_SECRET_KEY=your-secret-key-here

# Frontend & Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Volumes

Development volumes (for caching):
- `postgres_data` - Database data (persists)
- `bundle_cache` - Ruby gems
- `storage_data` - Active Storage files
- `node_modules` - Root workspace modules
- `frontend_node_modules` - Frontend modules
- `dashboard_node_modules` - Dashboard modules
- `shared_node_modules` - Shared package modules

## Testing the Setup

1. **Start services:**
   ```bash
   docker-compose up
   ```

2. **Check all services are running:**
   ```bash
   docker-compose ps
   ```

3. **Access services:**
   - Backend: http://localhost:3000/api/v1/properties
   - Frontend: http://localhost:3001
   - Dashboard: http://localhost:3002/dashboard

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

## Next Steps

1. **Set up environment variables** - Create `.env` file
2. **Run database migrations** - `make db-migrate`
3. **Seed database** - `make db-seed`
4. **Start development** - `make dev`
5. **Build for production** - `./docker-build.sh`

## Troubleshooting

See [DOCKER.md](DOCKER.md#troubleshooting) for detailed troubleshooting guide.

Common issues:
- Port conflicts → Change ports in docker-compose.yml
- Module not found → Rebuild from root directory
- Slow builds → Check .dockerignore files
- Database errors → Check health status with `docker-compose ps`

## Documentation

- [DOCKER.md](DOCKER.md) - Complete Docker guide with examples
- [DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md) - Quick command reference
- [MONOREPO_STRUCTURE.md](MONOREPO_STRUCTURE.md) - Monorepo architecture
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [QUICK_START.md](QUICK_START.md) - Getting started guide

## Support

For issues:
1. Check [DOCKER.md](DOCKER.md#troubleshooting)
2. View logs: `docker-compose logs -f [service]`
3. Check service status: `docker-compose ps`
4. Restart service: `docker-compose restart [service]`

---

**Docker setup is complete and ready to use!** 🎉

Start with: `docker-compose up`
