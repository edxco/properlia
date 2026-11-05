# Docker Setup for Properlia Monorepo

This guide explains how to run the Properlia monorepo using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 1.29+
- Make (optional, for using Makefile commands)

## Quick Start

### Development Mode

Start all services (backend, frontend, dashboard, database):

```bash
# Using docker-compose
docker-compose up

# Or using make
make dev
```

Access the services:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:3001
- **Dashboard**: http://localhost:3002
- **Database**: localhost:5432

### Stop Services

```bash
# Stop all services
docker-compose down

# Or using make
make dev-down
```

## Docker Compose Files

### 1. `docker-compose.yml` (Development)

For local development with hot-reload:

```bash
docker-compose up
```

**Features**:
- Volume mounts for live code reload
- Development environment variables
- Node modules cached in volumes for faster startups

**Services**:
- `db` - PostgreSQL 15
- `backend` - Rails API (port 3000)
- `frontend` - Next.js public site (port 3001)
- `dashboard` - Next.js admin panel (port 3002)

### 2. `docker-compose.stage.yml` (Staging)

For staging environment with production builds:

```bash
docker-compose -f docker-compose.stage.yml up -d
```

**Requires**: Pre-built Docker images and environment variables in `.env.stage`

### 3. `docker-compose.prod.yml` (Production)

For production deployment:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Requires**: Pre-built Docker images and environment variables

## Building Docker Images

### Development

No build needed - uses volume mounts.

### Production/Staging

Build all images:

```bash
./docker-build.sh
```

Or build individually:

```bash
# Backend
docker build -t properlia-backend:latest \
  -f packages/backend/Dockerfile \
  packages/backend

# Frontend (with monorepo support)
docker build -t properlia-frontend:latest \
  -f packages/frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  .

# Dashboard (with monorepo support)
docker build -t properlia-dashboard:latest \
  -f packages/dashboard/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  .
```

**Important**: Frontend and Dashboard builds must be run from the **root directory** (not from packages/frontend or packages/dashboard) because they need access to the shared package.

## Environment Variables

### Development (.env)

Create `.env` in the root directory:

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

### Staging (.env.stage)

```env
# Database
POSTGRES_USER=properlia_user
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=properlia2025_staging

# Backend
BACKEND_IMAGE=properlia-backend:staging
BACKEND_PORT=3000
RAILS_ENV=staging
RAILS_MAX_THREADS=5
SECRET_KEY_BASE=your-secret-key-base
RAILS_SERVE_STATIC_FILES=true
RAILS_LOG_TO_STDOUT=true
ACTIVE_STORAGE_SERVICE=amazon
DEVISE_JWT_SECRET_KEY=your-jwt-secret

# AWS (if using S3)
AWS_REGION=us-east-1
AWS_BUCKET=properlia-staging
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Frontend & Dashboard
FRONTEND_IMAGE=properlia-frontend:staging
FRONTEND_PORT=3001
DASHBOARD_IMAGE=properlia-dashboard:staging
DASHBOARD_PORT=3002
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com

# CORS
CORS_ORIGINS=https://staging.yourdomain.com,https://app-staging.yourdomain.com
```

## Makefile Commands

The project includes a Makefile for convenience:

```bash
# Show all available commands
make help

# Development
make dev              # Start all services
make dev-build        # Build and start
make dev-down         # Stop services
make dev-logs         # Follow logs
make dev-clean        # Remove containers and volumes

# Production
make prod-build       # Build production images
make prod-up          # Start production services
make prod-down        # Stop production services
make prod-logs        # Follow production logs

# Staging
make stage-build      # Build staging images
make stage-up         # Start staging services
make stage-down       # Stop staging services
make stage-logs       # Follow staging logs

# Individual services
make backend          # Run only backend
make frontend         # Run only frontend
make dashboard        # Run only dashboard

# Database
make db-reset         # Reset database (WARNING: destroys data)
make db-migrate       # Run migrations
make db-seed          # Seed database

# Utilities
make shell-backend    # Open bash in backend container
make shell-frontend   # Open sh in frontend container
make shell-dashboard  # Open sh in dashboard container
make ps               # Show running containers
make install          # Install npm dependencies
make clean            # Remove all containers and images
make prune            # Clean up Docker system
```

## Monorepo Build Context

### Why Build from Root?

The frontend and dashboard Dockerfiles build from the **root directory** because they need access to the shared package:

```
Dockerfile context: /
├── package.json           # Workspace root
├── packages/
│   ├── frontend/
│   ├── dashboard/
│   └── shared/           # ← Both apps need this!
```

### Build Process

1. **Dependencies Stage**: Install workspace dependencies
2. **Builder Stage**: Copy shared + app code, then build
3. **Runner Stage**: Copy only production artifacts

### Volume Mounts in Development

In development mode, we mount the entire monorepo:

```yaml
volumes:
  - .:/monorepo                                    # Entire workspace
  - node_modules:/monorepo/node_modules           # Root modules
  - frontend_node_modules:/monorepo/packages/frontend/node_modules
  - shared_node_modules:/monorepo/packages/shared/node_modules
  - dashboard_node_modules:/monorepo/packages/dashboard/node_modules
```

This allows:
- Hot reload for code changes
- Shared package changes reflect immediately
- Faster rebuilds (node_modules are cached)

## Troubleshooting

### Frontend/Dashboard can't find shared package

**Problem**: `Module not found: @properlia/shared`

**Solution**:
1. Make sure you're building from the root directory
2. Check that `package.json` is in the root
3. Verify workspace configuration

### Slow builds

**Problem**: Docker builds are slow

**Solution**:
1. Use `.dockerignore` to exclude unnecessary files
2. Use Docker BuildKit: `DOCKER_BUILDKIT=1 docker build ...`
3. Cache node_modules in named volumes

### Port conflicts

**Problem**: Port already in use

**Solution**:
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3001"  # Change left side: "3005:3001"
```

### Database connection errors

**Problem**: Backend can't connect to database

**Solution**:
1. Wait for database health check
2. Check `DATABASE_URL` environment variable
3. Ensure database is running: `docker-compose ps`

### Changes not reflecting

**Problem**: Code changes don't show up

**Solution**:

For development:
```bash
# Restart the service
docker-compose restart frontend
```

For production:
```bash
# Rebuild the image
./docker-build.sh
docker-compose -f docker-compose.prod.yml up -d
```

## Next.js Standalone Output

The Dockerfiles use Next.js standalone output for smaller images:

**Enable in `next.config.js`**:
```javascript
module.exports = {
  output: 'standalone',
}
```

This creates a minimal production build with only necessary dependencies.

## Production Deployment

### 1. Build Images

```bash
./docker-build.sh
```

### 2. Tag for Registry

```bash
# Tag images
docker tag properlia-backend:latest registry.example.com/properlia-backend:v1.0.0
docker tag properlia-frontend:latest registry.example.com/properlia-frontend:v1.0.0
docker tag properlia-dashboard:latest registry.example.com/properlia-dashboard:v1.0.0

# Push to registry
docker push registry.example.com/properlia-backend:v1.0.0
docker push registry.example.com/properlia-frontend:v1.0.0
docker push registry.example.com/properlia-dashboard:v1.0.0
```

### 3. Deploy

```bash
# On production server
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Health Checks

All services include health checks:

```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:3001/ || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
```

Check health:
```bash
docker-compose ps
```

## Logs

View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f dashboard
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

## Cleanup

```bash
# Remove containers and networks
docker-compose down

# Remove containers, networks, and volumes (WARNING: deletes database)
docker-compose down -v

# Remove everything including images
docker-compose down -v --rmi all

# Clean up Docker system
docker system prune -af --volumes
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build images
        run: ./docker-build.sh

      - name: Push to registry
        run: |
          docker tag properlia-frontend:latest ${{ secrets.REGISTRY }}/frontend:${{ github.sha }}
          docker push ${{ secrets.REGISTRY }}/frontend:${{ github.sha }}
```

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
