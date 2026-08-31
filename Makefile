# Makefile for Properlia Monorepo Docker Management

.PHONY: help dev dev-build dev-down dev-logs prod-build prod-up prod-down stage-build stage-up stage-down clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development commands
dev: ## Start all services in development mode
	docker-compose up

dev-build: ## Build and start all services in development mode
	docker-compose up --build

dev-down: ## Stop all development services
	docker-compose down

dev-logs: ## Follow logs for all development services
	docker-compose logs -f

dev-clean: ## Stop and remove all development containers, networks, and volumes
	docker-compose down -v

# Production commands
prod-build: ## Build production Docker images
	./docker-build.sh

prod-up: ## Start all services in production mode
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Stop all production services
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## Follow logs for all production services
	docker-compose -f docker-compose.prod.yml logs -f

# Staging commands
stage-build: ## Build staging Docker images
	./docker-build.sh

stage-up: ## Start all services in staging mode
	docker-compose -f docker-compose.stage.yml up -d

stage-down: ## Stop all staging services
	docker-compose -f docker-compose.stage.yml down

stage-logs: ## Follow logs for all staging services
	docker-compose -f docker-compose.stage.yml logs -f

# Individual service commands
backend: ## Start only backend service
	docker-compose up backend

frontend: ## Start only frontend service
	docker-compose up frontend

dashboard: ## Start only dashboard service
	docker-compose up dashboard

# Database commands
db-reset: ## Reset the database (WARNING: destroys all data)
	docker-compose down -v
	docker-compose up -d db
	@echo "Waiting for database to be ready..."
	@sleep 5
	docker-compose exec backend bundle exec rails db:create db:migrate db:seed

db-migrate: ## Run database migrations
	docker-compose exec backend bundle exec rails db:migrate

db-seed: ## Seed the database
	docker-compose exec backend bundle exec rails db:seed

# Clean commands
clean: ## Remove all Docker containers, images, and volumes
	docker-compose down -v --rmi all

prune: ## Remove unused Docker resources
	docker system prune -af --volumes

# Utility commands
shell-backend: ## Open a shell in the backend container
	docker-compose exec backend bash

shell-frontend: ## Open a shell in the frontend container
	docker-compose exec frontend sh

shell-dashboard: ## Open a shell in the dashboard container
	docker-compose exec dashboard sh

ps: ## Show running containers
	docker-compose ps

install: ## Install dependencies for all packages
	npm install
