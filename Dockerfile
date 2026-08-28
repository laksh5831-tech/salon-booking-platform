# ---- Stage 1: build the Vite web app ----
FROM node:20-alpine AS web-builder
WORKDIR /repo
COPY apps/web/package*.json apps/web/
RUN cd apps/web && npm install --no-audit --no-fund
COPY apps/web/ apps/web/
RUN cd apps/web && npm run build

# ---- Stage 2: runtime (backend + built web app) ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY backend/package*.json backend/
RUN cd backend && npm install --omit=dev --no-audit --no-fund

COPY backend/ backend/
COPY --from=web-builder /repo/apps/web/dist apps/web/dist

WORKDIR /app/backend
EXPOSE 10000
CMD ["node", "src/server.js"]