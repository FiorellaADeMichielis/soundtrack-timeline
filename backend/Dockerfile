# Stage 1: Build y compilación TypeScript en Monorepo
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/shared ./packages/shared
COPY backend ./backend

RUN npm ci
RUN npm run build --workspace=@soundtrack-timeline/shared
RUN npm run build --workspace=backend

# Stage 2: Runtime no-root ultraligero
FROM node:22-alpine AS runner
WORKDIR /usr/src/app

USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/packages/shared/dist ./packages/shared/dist
COPY --chown=node:node --from=builder /usr/src/app/packages/shared/package.json ./packages/shared/package.json
COPY --chown=node:node --from=builder /usr/src/app/backend/dist ./backend/dist
COPY --chown=node:node --from=builder /usr/src/app/backend/package.json ./backend/package.json

ENV NODE_ENV=production \
    PORT=4000

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) process.exit(1)})"

CMD ["node", "backend/dist/main.js"]