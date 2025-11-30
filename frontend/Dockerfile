FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build client (Vite) and Nest server
RUN npm run client:build && npm run build:server

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install prod dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy build outputs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
