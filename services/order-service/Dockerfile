# ────── Stage 1: builder (dev-зависимости + TS-компилятор) ──────
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Манифесты ВСЕХ воркспейсов, нужных для разрешения дерева npm ci
COPY package.json package-lock.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/api-client/package.json ./packages/api-client/
COPY services/order-service/package.json ./services/order-service/
COPY tsconfig.base.json tsconfig.json ./

# 2. Все зависимости (вкл. dev — нужен tsc)
RUN npm ci

# 3. Исходники: только нужный сервис + общие пакеты
COPY packages ./packages
COPY services/order-service ./services/order-service

# 4. Сборка подграфа orders-service (shared-utils + api-client + orders-service)
RUN npx tsc -b services/order-service


# ────── Stage 2: runtime (только prod-зависимости + собранный код) ──────
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Манифесты — для npm ci --omit=dev (воссоздаёт workspace-симлинки)
COPY package.json package-lock.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/api-client/package.json ./packages/api-client/
COPY services/order-service/package.json ./services/order-service/

# Только прод-зависимости
RUN npm ci --omit=dev

# Собранные артефакты из builder
COPY --from=builder /app/packages/shared-utils/dist ./packages/shared-utils/dist
COPY --from=builder /app/packages/api-client/dist ./packages/api-client/dist
COPY --from=builder /app/services/order-service/dist ./services/order-service/dist

EXPOSE 3002
# exec-форма: Node получает сигналы напрямую
CMD ["node", "services/order-service/dist/index.js"]
