# Docker Quick Reference

## Start Development Environment

```bash
# Start all services
docker-compose up

# Or run in background
docker-compose up -d

# Or using make
make dev
```

**Access:**
- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- Dashboard: http://localhost:3002

## Common Commands

```bash
# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f dashboard

# Restart a service
docker-compose restart frontend

# Rebuild and restart
docker-compose up --build frontend

# List running containers
docker-compose ps
```

## Database Commands

```bash
# Run migrations
docker-compose exec backend bundle exec rails db:migrate

# Seed database
docker-compose exec backend bundle exec rails db:seed

# Reset database (WARNING: destroys all data)
make db-reset
```

## Shell Access

```bash
# Backend (Rails console)
docker-compose exec backend bash
docker-compose exec backend bundle exec rails console

# Frontend
docker-compose exec frontend sh

# Dashboard
docker-compose exec dashboard sh
```

## Production Build

```bash
# Build all images
./docker-build.sh

# Or individually
docker build -t properlia-frontend:latest -f packages/frontend/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com .
docker build -t properlia-dashboard:latest -f packages/dashboard/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com .
docker build -t properlia-backend:latest -f packages/backend/Dockerfile packages/backend

# Run production
docker-compose -f docker-compose.prod.yml up -d
```

## Cleanup

```bash
# Remove containers
docker-compose down

# Remove containers and volumes (deletes database)
docker-compose down -v

# Clean everything
make clean

# Prune Docker system
make prune
```

## Troubleshooting

**Port conflict:**
```bash
# Change port mapping in docker-compose.yml
ports:
  - "3005:3001"  # Host:Container
```

**Module not found:**
```bash
# Reinstall dependencies
docker-compose down
docker-compose up --build
```

**Database issues:**
```bash
# Check database health
docker-compose ps

# Restart database
docker-compose restart db
```

**View service status:**
```bash
docker-compose ps
docker-compose logs backend
```

## Environment Variables

Create `.env` file in root:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=properlia2025_development
DEVISE_JWT_SECRET_KEY=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## File Structure

```
/
├── docker-compose.yml          # Development
├── docker-compose.stage.yml    # Staging
├── docker-compose.prod.yml     # Production
├── docker-build.sh             # Build script
├── Makefile                    # Make commands
└── packages/
    ├── backend/Dockerfile
    ├── frontend/Dockerfile     # Needs root context
    └── dashboard/Dockerfile    # Needs root context
```

## Important Notes

- **Always build frontend/dashboard from root directory** (they need shared package)
- Use volume mounts in development for hot reload
- Use standalone builds in production for smaller images
- Database data persists in Docker volumes

## Quick Reference: Makefile

```bash
make help           # Show all commands
make dev            # Start development
make dev-down       # Stop development
make dev-logs       # View logs
make prod-build     # Build production
make prod-up        # Start production
make db-reset       # Reset database
make shell-backend  # Open backend shell
```

For detailed information, see [DOCKER.md](./DOCKER.md)
