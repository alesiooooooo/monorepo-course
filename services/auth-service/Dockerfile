# ────── Stage 1: builder (dev-зависимости + TS-компилятор) ──────
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Манифесты ВСЕХ воркспейсов, нужных для разрешения дерева npm ci
COPY package.json package-lock.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/api-client/package.json ./packages/api-client/
COPY services/auth-service/package.json ./services/auth-service/
COPY tsconfig.base.json tsconfig.json ./

# 2. Все зависимости (вкл. dev — нужен tsc)
RUN npm ci

# 3. Исходники: только нужный сервис + общие пакеты
COPY packages ./packages
COPY services/auth-service ./services/auth-service

# 4. Сборка ИМЕННО подграфа auth-service (shared-utils + api-client + auth-service).
#    Не корневой `npm run build`: root tsconfig ссылается на orders/payments,
#    которых в этом образе нет.
RUN npx tsc -b services/auth-service


# ────── Stage 2: runtime (только prod-зависимости + собранный код) ──────
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Манифесты — для npm ci --omit=dev (воссоздаёт workspace-симлинки)
COPY package.json package-lock.json ./
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/api-client/package.json ./packages/api-client/
COPY services/auth-service/package.json ./services/auth-service/

# Только прод-зависимости (без typescript, @types/*, eslint, turbo, tsx)
RUN npm ci --omit=dev

# Собранные артефакты из builder
COPY --from=builder /app/packages/shared-utils/dist ./packages/shared-utils/dist
COPY --from=builder /app/packages/api-client/dist ./packages/api-client/dist
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist

EXPOSE 3001
# exec-форма: Node получает сигналы (SIGTERM) напрямую для graceful shutdown
CMD ["node", "services/auth-service/dist/index.js"]
