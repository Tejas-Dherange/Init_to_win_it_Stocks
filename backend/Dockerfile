# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for build (including openssl for Prisma)
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only and openssl
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts and prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client for production
RUN npx prisma generate

# Expose API port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
