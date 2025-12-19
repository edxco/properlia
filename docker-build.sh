#!/bin/bash

# Docker Build Script for Properlia Monorepo
# This script builds Docker images for all services

set -e

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Default values
API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3000}
BACKEND_TAG=${BACKEND_TAG:-properlia-backend:latest}
FRONTEND_TAG=${FRONTEND_TAG:-properlia-frontend:latest}
DASHBOARD_TAG=${DASHBOARD_TAG:-properlia-dashboard:latest}

echo "========================================="
echo "Building Properlia Docker Images"
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
