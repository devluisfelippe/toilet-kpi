# syntax=docker/dockerfile:1

# ===== base =====================================================
# Debian slim (não-musl) para preservar a compilação nativa do bcrypt.
# Node 24: node:sqlite (módulo nativo) disponível sem flag.
FROM node:24-slim AS base
WORKDIR /app
# Ferramentas de build para módulos nativos (bcrypt).
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# ===== deps (todas as deps, incl. dev — necessárias para o build) =====
FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ===== dev (hot reload via volume; node_modules vem da imagem) =====
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["yarn", "start:dev"]

# ===== build (compila TS -> dist) =====
FROM deps AS build
COPY . .
RUN yarn build

# ===== prod (só runtime + dist + deps de produção) =====
FROM base AS prod
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
