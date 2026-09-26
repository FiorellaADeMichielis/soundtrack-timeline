# Stage 1: Build de la SPA con Vite y React 19 en Monorepo
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/shared ./packages/shared
COPY frontend ./frontend

RUN npm ci
RUN npm run build --workspace=@soundtrack-timeline/shared
RUN npm run build --workspace=frontend

# Stage 2: Servidor estático Nginx en Alpine
FROM nginx:alpine AS runner

COPY --from=builder /usr/src/app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]