# Multi-stage build for Next.js Dashboard with Monorepo support

# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /monorepo

# Copy workspace root files
COPY package.json package-lock.json ./
COPY packages/dashboard/package.json ./packages/dashboard/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies using workspaces
RUN npm ci

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /monorepo

# Build argument - MUST be set during docker build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy dependencies
COPY --from=deps /monorepo/node_modules ./node_modules
COPY --from=deps /monorepo/packages/dashboard/node_modules ./packages/dashboard/node_modules
COPY --from=deps /monorepo/packages/shared/node_modules ./packages/shared/node_modules

# Copy workspace root
COPY package.json package-lock.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy dashboard package
COPY packages/dashboard ./packages/dashboard

# Set working directory to dashboard
WORKDIR /monorepo/packages/dashboard

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
COPY --from=builder /monorepo/packages/dashboard/public ./public
COPY --from=builder --chown=nextjs:nodejs /monorepo/packages/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /monorepo/packages/dashboard/.next/static ./.next/static

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
