# ============================================================
# Reflection Business ERP — Multi-stage Docker Build
# Next.js 16 · TypeScript · Prisma (SQLite) · bun runtime
# ============================================================

# ── Stage 1: Dependencies ──────────────────────────────────
FROM node:20-alpine AS deps

# Install bun
RUN npm install -g bun@1

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock ./

# Install dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────────
FROM node:20-alpine AS build

# Install bun
RUN npm install -g bun@1

WORKDIR /app

# Copy dependency manifests and installed node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./

# Copy source code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Build Next.js (standalone output)
RUN bun run build

# ── Stage 3: Production Runner ─────────────────────────────
FROM node:20-alpine AS runner

# Install bun for runtime
RUN npm install -g bun@1

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=build /app/.next/standalone ./

# Copy static assets (built during `bun run build`)
COPY --from=build /app/.next/static ./.next/static

# Copy public folder
COPY --from=build /app/public ./public

# Copy Prisma schema for potential migrations
COPY --from=build /app/prisma ./prisma

# Create data directory for SQLite persistence
RUN mkdir -p /app/data && mkdir -p /app/db

# Ensure proper ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Health check — verify the server responds
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["bun", ".next/standalone/server.js"]
