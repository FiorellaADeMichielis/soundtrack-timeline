# Stage 1: Build y compilación TypeScript
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json tsconfig*.json nest-cli.json ./
RUN npm install
COPY src ./src
RUN npm run build && npm prune --omit=dev

# Stage 2: Runtime no-root ultraligero
FROM node:22-alpine AS runner
WORKDIR /usr/src/app

USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV=production \
    PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) process.exit(1)})"

CMD ["node", "dist/main.js"]