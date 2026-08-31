# Multi-stage production Dockerfile for Diamora Properties API
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for bcrypt and native modules
RUN apk add --no-cache python3 make g++

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Final production image
FROM node:20-alpine

WORKDIR /app

# Add curl for healthchecks
RUN apk add --no-cache curl

# Copy installed dependencies and source code
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Set permissions for entrypoint script
RUN chmod +x docker-entrypoint.sh

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose API port
EXPOSE 5000

# Healthcheck definition
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:5000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
