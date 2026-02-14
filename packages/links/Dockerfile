# Multi-stage build for Next.js Links with Monorepo support

# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /monorepo

# Copy workspace root files
COPY package.json package-lock.json ./
COPY packages/links/package.json ./packages/links/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies using workspaces
RUN npm ci

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /monorepo

# Copy dependencies
COPY --from=deps /monorepo/node_modules ./node_modules

# Copy workspace root
COPY package.json package-lock.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy links package
COPY packages/links ./packages/links

# Set working directory to links
WORKDIR /monorepo/packages/links

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
COPY --from=builder /monorepo/packages/links/public ./public
COPY --from=builder --chown=nextjs:nodejs /monorepo/packages/links/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /monorepo/packages/links/.next/static ./packages/links/.next/static

USER nextjs

EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

CMD ["node", "packages/links/server.js"]
