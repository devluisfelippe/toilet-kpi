# Toilet KPI 🧻

Aplicação web gamificada: o usuário registra uma "cagada", recebe uma **missão**
de higiene aleatória e absurda (níveis `leve` / `medio` / `insano`), marca o
resultado (`cumprida` / `falhou` / `pulou`) e ganha ou perde **PCL (Pontos de Cu
Limpo)**, que definem sua **patente**. Há amizades e um **ranking** social por PCL.

Monorepo com três peças independentes: **backend** (API REST), **frontend** (web)
e **banco** (Cassandra).

## Stack

- **Backend:** NestJS 11 (TypeScript), `cassandra-driver`, JWT (`@nestjs/jwt`) +
  bcrypt, `class-validator`/`class-transformer`. Testes com Jest. Pacotes via **Yarn**.
- **Frontend:** Next.js 16 (App Router) + React 19, Tailwind CSS 4, Radix UI,
  Recharts. Pacotes via **npm**.
- **Banco:** Cassandra 5 (via Docker).

## Estrutura

```
toilet-kpi/
├── backend/                 # API NestJS + docker-compose (Cassandra) + Dockerfile
│   ├── src/
│   │   ├── auth/            # registro/login (JWT + bcrypt), JwtAuthGuard
│   │   ├── users/           # perfil, PCL, patente, histórico
│   │   ├── missions/        # catálogo + sorteio de missões
│   │   ├── cagadas/         # registrar e resolver (núcleo do jogo)
│   │   ├── friends/         # amizade mútua + ranking
│   │   ├── cassandra/       # conexão, criação de schema e seed
│   │   ├── domain/          # regras puras de PCL e patentes (scoring)
│   │   └── config/          # configuração tipada via env
│   ├── docker-compose.yml
│   └── .env.example
├── frontend/                # Next.js (telas: login/cadastro, home, social)
│   └── .env.local.example
└── docs/                    # plano técnico e tasks (Job Stories)
```

## Pré-requisitos

- **Node.js 20+** (a imagem Docker do backend usa Node 22)
- **Yarn** (backend) e **npm** (frontend)
- **Docker** + **Docker Compose** (para o Cassandra)

## Como rodar (local)

Suba na ordem **banco → backend → frontend**.

### 1. Banco (Cassandra)

```bash
cd backend
cp .env.example .env          # ajuste JWT_SECRET; os defaults servem para dev
docker compose up -d cassandra
```

Expõe o Cassandra em `localhost:9042` com healthcheck. **Não há migration manual:**
na primeira conexão o backend cria o keyspace `toilet_kpi`, as tabelas e faz o
**seed das missões** automaticamente.

### 2. Backend (NestJS — porta 3001)

```bash
cd backend
yarn install
yarn start:dev               # modo watch; loga "Cassandra pronto." ao conectar
```

Outros scripts: `yarn build`, `yarn test`, `yarn lint`.

### 3. Frontend (Next.js — porta 3000)

```bash
cd frontend
cp .env.local.example .env
npm install
npm run dev
```

Acesse <http://localhost:3000>.

### Alternativa: backend + banco via Docker

A partir de `backend/`, `docker compose up -d --build` sobe **Cassandra e backend**
(build de produção) juntos. Nesse modo, no `.env` troque
`CASSANDRA_CONTACT_POINTS=127.0.0.1` por `CASSANDRA_CONTACT_POINTS=cassandra`
(nome do serviço na rede do Compose). O frontend continua rodando no host.

## Seed (dados de teste)

Com o backend rodando, popule o banco com 3 usuários de teste que já são amigos e possuem cagadas registradas:

```bash
cd backend
yarn seed
```

> Pré-requisito: o backend precisa estar no ar (`docker compose up -d cassandra` + `yarn start:dev`, ou `docker compose up -d --build`).

Se um usuário já existir, o script faz login automaticamente e continua sem interromper a execução.

### Credenciais

| Usuário | Senha    |
| ------- | -------- |
| joao    | senha123 |
| maria   | senha123 |
| carlos  | senha123 |

Os três são amigos entre si e cada um tem 4 cagadas resolvidas com resultados `cumprida`, `falhou`, `pulou`, `cumprida`.

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável                   | Padrão                  | Descrição                                          |
| -------------------------- | ----------------------- | -------------------------------------------------- |
| `PORT`                     | `3001`                  | Porta da API                                       |
| `CASSANDRA_CONTACT_POINTS` | `127.0.0.1`             | Host(s) do Cassandra (`cassandra` dentro do Compose) |
| `CASSANDRA_LOCAL_DC`       | `datacenter1`           | Data center local                                  |
| `CASSANDRA_KEYSPACE`       | `toilet_kpi`            | Keyspace                                           |
| `JWT_SECRET`               | `dev-secret`            | Segredo do JWT (troque em produção)                |
| `JWT_EXPIRES_IN`           | `7d`                    | Validade do token                                  |
| `CORS_ORIGIN`              | `http://localhost:3000` | Origem permitida (frontend)                        |

### Frontend (`frontend/.env`)

| Variável              | Padrão                  | Descrição              |
| --------------------- | ----------------------- | ---------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Base da API do backend |

## API (visão geral)

| Método | Rota                    | Auth   | Descrição                                            |
| ------ | ----------------------- | ------ | ---------------------------------------------------- |
| POST   | `/auth/register`        | —      | Cria conta (nickname + senha) → `{ token, nickname }` |
| POST   | `/auth/login`           | —      | Login → `{ token, nickname }`                        |
| GET    | `/me`                   | Bearer | Perfil: PCL, patente e histórico recente             |
| POST   | `/cagadas`              | Bearer | Registra a cagada e sorteia a missão                 |
| POST   | `/cagadas/:id/resolver` | Bearer | Resolve (`cumprida`/`falhou`/`pulou`) e pontua       |
| POST   | `/friends`              | Bearer | Adiciona amizade mútua por nickname                  |
| GET    | `/friends/ranking`      | Bearer | Ranking por PCL (com títulos honoríficos)            |

Rotas protegidas exigem o header `Authorization: Bearer <token>`.

## Testes

```bash
cd backend
yarn test
```

Os testes unitários rodam **sem Cassandra** — o grafo de injeção de dependências
é validado sem abrir conexão com o banco.

## Documentação

- Plano técnico: `docs/superpowers/plans/`
- Tasks (Job Stories — backend e frontend): `docs/tasks/`

## Swagger

- Após rodar o backend (via compose ou yarn start:dev): `http://localhost:3001/documentation`
