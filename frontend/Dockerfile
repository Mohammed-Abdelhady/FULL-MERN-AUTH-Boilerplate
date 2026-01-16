# Multi-stage build for Next.js frontend
# Stage 1: Base
FROM node:20-alpine AS base

# Install dependencies for native modules if needed
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Stage 3: Builder
FROM deps AS builder

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Stage 4: Development
FROM base AS development

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code for hot reload
COPY . .

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["npm", "run", "dev"]

# Stage 5: Production
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nextjs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built artifacts and standalone files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["node", "server.js"]
