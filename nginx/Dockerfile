# Multi-stage build for Nginx reverse proxy
# Stage 1: Base
FROM nginx:1.25-alpine AS base

# Install required packages
RUN apk add --no-cache \
    curl \
    ca-certificates \
    openssl

# Create directories for SSL certificates
RUN mkdir -p /etc/nginx/ssl /var/www/certbot

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Remove default nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Set proper permissions
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/ssl /var/www/certbot

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Switch to non-root user
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
