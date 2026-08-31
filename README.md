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

## Prerequisites

- Docker and Docker Compose installed
- Git

## Quick Start with Docker

### 1. Clone the Repository

```bash
git clone <repository-url>
cd properlia2025
```

### 2. Set Up Environment Variables

Create environment variables for the backend. You'll need to set the JWT secret key:

```bash
# Generate a secret key
cd packages/backend
docker-compose run --rm backend bundle exec rails secret
```

Copy the generated secret and create a `.env` file in the project root:

```bash
# Create .env file in project root
cat > .env << EOF
DEVISE_JWT_SECRET_KEY=<paste-the-generated-secret-here>
DATABASE_URL=postgres://postgres:postgres@db:5432/properlia2025_development
RAILS_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
```

### 3. Build and Start Services

```bash
# From project root
docker-compose up --build
```

This will start:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:3001
- **PostgreSQL**: localhost:5432

### 4. Initialize the Database

In a new terminal, run:

```bash
# Create database
docker-compose exec backend bin/rails db:create

# Run migrations
docker-compose exec backend bin/rails db:migrate

# Seed initial data (property types)
docker-compose exec backend bin/rails db:seed
```

### 5. Verify Installation

```bash
# Check health endpoint
curl http://localhost:3000/health

# Get property types
curl http://localhost:3000/api/v1/property_types
```

## Development Workflow

### Running Services

```bash
# Start all services
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Start only specific services
docker-compose up backend
docker-compose up frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

### Database Management

```bash
# Run migrations
docker-compose exec backend bin/rails db:migrate

# Rollback last migration
docker-compose exec backend bin/rails db:rollback

# Reset database (drop, create, migrate, seed)
docker-compose exec backend bin/rails db:reset

# Run seeds
docker-compose exec backend bin/rails db:seed

# Rails console
docker-compose exec backend bin/rails console
```

### Common Development Commands

```bash
# Generate migration
docker-compose exec backend bin/rails generate migration MigrationName

# Generate model
docker-compose exec backend bin/rails generate model ModelName

# Install new gem
# 1. Add gem to packages/backend/Gemfile
# 2. Run:
docker-compose exec backend bundle install
# 3. Rebuild if needed:
docker-compose up --build backend

# Install npm package
docker-compose exec frontend npm install <package-name>

# Run frontend dev server manually
docker-compose exec frontend npm run dev
```

## Backend (Rails API)

Location: `packages/backend`

- **Framework**: Rails 7 (API mode)
- **Database**: PostgreSQL 15 with UUID primary keys
- **Storage**: Active Storage (S3 for production/staging, local for development)
- **Authentication**: Devise + JWT
- **Port**: 3000

### Key Features
- Property management API with pagination (Pagy gem)
- Property types CRUD
- Image and video uploads with Active Storage
- JWT-based authentication
- CORS configured for frontend origins

### API Endpoints

#### Authentication
```bash
# Register new user
POST /users
Content-Type: application/json
{
  "user": {
    "email": "user@example.com",
    "password": "password123"
  }
}

# Login
POST /users/sign_in
Content-Type: application/json
{
  "user": {
    "email": "user@example.com",
    "password": "password123"
  }
}
# Returns: JWT token in Authorization header

# Logout
DELETE /users/sign_out
Authorization: Bearer <token>
```

#### Property Types
```bash
# List all property types
GET /api/v1/property_types

# Get single property type
GET /api/v1/property_types/:id

# Create property type (requires auth)
POST /api/v1/property_types
Authorization: Bearer <token>
Content-Type: application/json
{
  "property_type": {
    "name": "apartment",
    "es_name": "apartamento"
  }
}

# Update property type (requires auth)
PUT /api/v1/property_types/:id
Authorization: Bearer <token>

# Delete property type (requires auth, fails if assigned to properties)
DELETE /api/v1/property_types/:id
Authorization: Bearer <token>
```

#### Properties
```bash
# List all properties (paginated)
GET /api/v1/properties

# Get single property
GET /api/v1/properties/:id

# Create property with images (requires auth)
POST /api/v1/properties
Authorization: Bearer <token>
Content-Type: multipart/form-data

property[title]: Beautiful House
property[address]: 123 Main St
property[price]: 500000
property[property_type_id]: <uuid>
property[images][]: <file1>
property[images][]: <file2>
property[videos][]: <video1>

# Update property (requires auth)
PUT /api/v1/properties/:id
Authorization: Bearer <token>

# Delete attachment (requires auth)
DELETE /api/v1/properties/:id/attachments/:attachment_id
Authorization: Bearer <token>
```

## Frontend (Next.js)

Location: `packages/frontend`

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Port**: 3001

### Environment Variables

The frontend requires the API URL to be set at **build time**:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important**: `NEXT_PUBLIC_*` variables are baked into the JavaScript bundle during build, not at runtime.

## Deployment

### Staging Environment

```bash
# Set up environment variables in .env.stage
cat > .env.stage << EOF
BACKEND_IMAGE=<ecr-url>/properlia-backend:stage
FRONTEND_IMAGE=<ecr-url>/properlia-frontend:stage
DATABASE_URL=postgres://user:pass@db:5432/properlia_staging
RAILS_ENV=staging
ACTIVE_STORAGE_SERVICE=amazon
AWS_REGION=us-east-1
BACKEND_PORT=3000
FRONTEND_PORT=3001
NEXT_PUBLIC_API_URL=https://api-stage.yourdomain.com
DEVISE_JWT_SECRET_KEY=<your-secret>
EOF

# Deploy
docker-compose -f docker-compose.stage.yml up -d

# Run migrations
docker-compose -f docker-compose.stage.yml exec backend bin/rails db:migrate

# Seed data
docker-compose -f docker-compose.stage.yml exec backend bin/rails db:seed
```

### Production Environment

```bash
# Set up environment variables in .env.prod
cat > .env.prod << EOF
BACKEND_IMAGE=<ecr-url>/properlia-backend:prod
FRONTEND_IMAGE=<ecr-url>/properlia-frontend:prod
DATABASE_URL=postgres://user:pass@db:5432/properlia_production
RAILS_ENV=production
ACTIVE_STORAGE_SERVICE=amazon
AWS_REGION=us-east-1
BACKEND_PORT=3000
FRONTEND_PORT=3001
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
DEVISE_JWT_SECRET_KEY=<your-secret>
EOF

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend bin/rails db:migrate
```

## Environment Variables Reference

### Backend Required Variables
- `DEVISE_JWT_SECRET_KEY` - Secret key for JWT tokens (generate with `rails secret`)
- `DATABASE_URL` - PostgreSQL connection string
- `RAILS_ENV` - Environment (development/staging/production)

### Backend Optional Variables
- `ACTIVE_STORAGE_SERVICE` - Storage service (local/amazon), defaults to 'local'
- `AWS_ACCESS_KEY_ID` - AWS credentials for S3 (staging/production)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `S3_BUCKET_NAME` - S3 bucket name

### Frontend Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL (baked into build)

## Troubleshooting

### "No verification key available" Error

This means `DEVISE_JWT_SECRET_KEY` is not set. Generate and set it:

```bash
# Generate secret
docker-compose exec backend bin/rails secret

# Add to .env file
echo "DEVISE_JWT_SECRET_KEY=<generated-secret>" >> .env

# Restart backend
docker-compose restart backend
```

### Database Connection Issues

```bash
# Check if database container is running
docker-compose ps

# Check database logs
docker-compose logs db

# Recreate database
docker-compose exec backend bin/rails db:drop db:create db:migrate db:seed
```

### Frontend Can't Connect to Backend

1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend is running: `curl http://localhost:3000/health`
3. Check CORS settings in `packages/backend/config/initializers/cors.rb`
4. For production, rebuild frontend with correct API URL

### Reset Everything

```bash
# Stop and remove all containers, volumes, and networks
docker-compose down -v

# Rebuild from scratch
docker-compose up --build

# Reinitialize database
docker-compose exec backend bin/rails db:create db:migrate db:seed
```

## CI/CD

GitHub Actions workflow (`.github/workflows/deploy-ec2.yml`) automatically:
- Builds separate Docker images for backend and frontend
- Passes environment-specific `NEXT_PUBLIC_API_URL` during frontend build
- Pushes images to Amazon ECR with branch-based tags
- Deploys to EC2 instances
- Runs database migrations on backend

### Required GitHub Secrets
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `EC2_HOST`
- `EC2_USERNAME`
- `EC2_SSH_KEY`
- `STAGE_API_URL` - API URL for staging builds
- `PROD_API_URL` - API URL for production builds

## License

See LICENSE file.
