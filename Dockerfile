# 1) Install deps
FROM node:18 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2) Build the app
FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Run with only production deps and built artifacts
FROM node:18 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

# Expose the app port
EXPOSE 5000

# Start the compiled server (adjust path if different)
CMD ["node", "dist/server.js"]
