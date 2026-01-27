#!/bin/bash

# Docker Build Script for Properlia Monorepo
# This script builds Docker images for all services
#
# Usage:
#   ./docker-build.sh              # Uses .env (development)
#   ./docker-build.sh stage        # Uses .env.stage (staging)
#   ./docker-build.sh prod         # Uses .env.prod (production)

set -e

# Determine which env file to use
ENV_FILE=".env"
if [ "$1" = "stage" ] || [ "$1" = "staging" ]; then
  ENV_FILE=".env.stage"
elif [ "$1" = "prod" ] || [ "$1" = "production" ]; then
  ENV_FILE=".env.prod"
fi

# Load environment variables
if [ -f "$ENV_FILE" ]; then
  echo "Loading environment from: $ENV_FILE"
  export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
else
  echo "Warning: $ENV_FILE not found, using defaults"
fi

# Default values
API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3000/api/v1}
BACKEND_TAG=${BACKEND_TAG:-properlia-backend:latest}
FRONTEND_TAG=${FRONTEND_TAG:-properlia-frontend:latest}
DASHBOARD_TAG=${DASHBOARD_TAG:-properlia-dashboard:latest}

echo "========================================="
echo "Building Properlia Docker Images"
echo "========================================="
echo "Environment: $ENV_FILE"
echo "API URL: $API_URL"
echo "========================================="
echo ""

# Build Backend
echo "📦 Building Backend..."
docker build \
  -t $BACKEND_TAG \
  -f packages/backend/Dockerfile \
  packages/backend
echo "✅ Backend built: $BACKEND_TAG"
echo ""

# Build Frontend
echo "📦 Building Frontend..."
docker build \
  -t $FRONTEND_TAG \
  -f packages/frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=$API_URL \
  .
echo "✅ Frontend built: $FRONTEND_TAG"
echo ""

# Build Dashboard
echo "📦 Building Dashboard..."
docker build \
  -t $DASHBOARD_TAG \
  -f packages/dashboard/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=$API_URL \
  .
echo "✅ Dashboard built: $DASHBOARD_TAG"
echo ""

echo "========================================="
echo "✅ All images built successfully!"
echo "========================================="
echo ""
echo "Built images:"
echo "  - Backend:   $BACKEND_TAG"
echo "  - Frontend:  $FRONTEND_TAG"
echo "  - Dashboard: $DASHBOARD_TAG"
echo ""
echo "To run with production settings:"
echo "  docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "To run with staging settings:"
echo "  docker-compose -f docker-compose.stage.yml up -d"
