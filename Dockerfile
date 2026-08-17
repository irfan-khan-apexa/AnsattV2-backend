# 1) Install dependencies
FROM node:18 AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci


# 2) Build application
FROM node:18 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# 3) Production Image
FROM node:18 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Compiled application
COPY --from=builder /app/dist ./dist

# Sequelize Config
COPY --from=builder /app/src/config ./src/config

# Migrations
COPY --from=builder /app/src/migrations ./src/migrations

EXPOSE 5000

# Run application as non-root user
USER node

# Run migrations then start server
CMD ["sh", "-c", "npm run migrate && node dist/server.js"]