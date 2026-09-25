# Stage 1: Build de la SPA con Vite y React 19
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json tsconfig*.json vite.config.ts index.html ./
RUN npm install

COPY public ./public
COPY src ./src
RUN npm run build

# Stage 2: Servidor estático Nginx en Alpine
FROM nginx:alpine AS runner

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]