# Properlia - Real Estate Management Platform

A modern real estate management platform built with Rails API backend and Next.js frontend.

## Project Structure

```
properlia2025/
├── packages/
│   ├── backend/          # Rails 7 API
│   └── frontend/         # Next.js App
├── docker-compose.yml    # Development environment
├── docker-compose.stage.yml  # Staging environment
└── docker-compose.prod.yml   # Production environment
```

## Quick Start

### Development

```bash
# Start all services (backend, frontend, database)
docker-compose up --build

# Backend API will be available at: http://localhost:3000
# Frontend will be available at: http://localhost:3001
# PostgreSQL will be available at: localhost:5432
```

### Individual Services

```bash
# Start only backend
docker-compose up backend

# Start only frontend
docker-compose up frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Common Commands

```bash
# Rails console
docker-compose exec backend bundle exec rails console

# Database migrations
docker-compose exec backend bundle exec rails db:migrate

# Install npm packages
docker-compose exec frontend npm install <package-name>

# Stop all services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

## Backend (Rails API)

Location: `packages/backend`

- **Framework**: Rails 7 (API mode)
- **Database**: PostgreSQL 15
- **Storage**: Active Storage (S3 for production/staging, local for development)
- **Authentication**: Devise + JWT
- **Port**: 3000

### Key Features
- Property management API
- Image and video uploads with Active Storage
- JWT-based authentication
- CORS configured for frontend origins

## Frontend (Next.js)

Location: `packages/frontend`

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Port**: 3001

### Environment Variables

Create `.env.local` in `packages/frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Deployment

### Staging

```bash
# Uses docker-compose.stage.yml
docker-compose -f docker-compose.stage.yml --env-file .env.stage up -d
```

### Production

```bash
# Uses docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Environment Variables

Copy `.env.example` and create environment-specific files:
- `.env` - Local development
- `.env.stage` - Staging environment
- `.env.prod` - Production environment

## CI/CD

GitHub Actions workflow automatically:
- Builds Docker images for backend and frontend
- Pushes to Amazon ECR
- Deploys to EC2 instances
- Runs database migrations

## License

See LICENSE file.
