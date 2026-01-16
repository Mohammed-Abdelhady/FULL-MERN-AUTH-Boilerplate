# Multi-stage build for NestJS backend
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

# Build TypeScript to JavaScript
RUN npm run build

# Stage 4: Development
FROM base AS development

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code for hot reload
COPY . .

# Expose port
EXPOSE 5000

# Start development server with hot reload
CMD ["npm", "run", "start:dev"]

# Stage 5: Production
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nestjs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R nestjs:nestjs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["node", "dist/main"]
