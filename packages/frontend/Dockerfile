# Multi-stage build for Next.js Frontend with Monorepo support

# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /monorepo

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

# Copy workspace root files
COPY package.json package-lock.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci --build-from-source

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /monorepo

# Build argument - MUST be set during docker build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy dependencies
COPY --from=deps /monorepo/node_modules ./node_modules

# Copy workspace root
COPY package.json package-lock.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy frontend package
COPY packages/frontend ./packages/frontend

# Set working directory to frontend
WORKDIR /monorepo/packages/frontend

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /monorepo/packages/frontend/public ./public
COPY --from=builder --chown=nextjs:nodejs /monorepo/packages/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /monorepo/packages/frontend/.next/static ./packages/frontend/.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "packages/frontend/server.js"]
