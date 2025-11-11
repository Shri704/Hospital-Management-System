# -----------------------
# Stage 1: Build Stage
# -----------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# -----------------------
# Stage 2: Production Image
# -----------------------
FROM node:18-alpine

WORKDIR /app

# Copy only required files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/seed ./seed

ENV NODE_ENV=production

# Expose API port
EXPOSE 5000

# Start command
CMD ["node", "src/server.js"]
