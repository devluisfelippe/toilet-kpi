# Toilet KPI — Missões por Cagada (MVP) — Variante SQLite + Prisma

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Mesmo MVP do Toilet KPI, porém persistindo em **SQLite via Prisma** (embedded, zero infra) em vez de Cassandra.

**Architecture:** Idêntica ao plano base, trocando a camada de persistência. Os _services_, controllers, DTOs, domínio, missões e frontend são **reaproveitados sem alteração** do plano base, porque os repositórios mantêm exatamente as mesmas assinaturas. Só mudam: infra (Phase 0), o módulo de banco (Prisma no lugar do Cassandra) e os 3 repositórios.

**Tech Stack:** NestJS 11, Prisma + SQLite, bcrypt, @nestjs/jwt; Next.js 16 + React 19; Jest.

---

## ⚠️ Regras e leitura obrigatória

1. **NÃO commitar sem permissão expressa do usuário.** Peça antes de cada `git commit`.
2. **Este plano é um _delta_ do plano base** `docs/superpowers/plans/2026-05-30-toilet-kpi-missoes.md`. Tenha-o à mão: as tasks marcadas como **[REUSO]** abaixo usam o código **exato** do plano base.
3. **Next.js 16** — leia os docs locais antes do frontend (igual ao base).
4. Comandos de backend rodam de `backend/`; frontend de `frontend/`.

## Diferenças de modelagem vs. spec/Cassandra

- **Sem tabela `score_by_nick` separada:** como é relacional, o `pcl` vira uma coluna em `User` (int, default 0). `getScore`/`setScore` leem/escrevem `User.pcl`. O piso em 0 continua na lógica de domínio (`aplicarPcl`).
- **Sem tabela `missions`:** o catálogo curado vive só em código (`missions.catalog.ts`) e o sorteio é em memória (`MissionsService`), exatamente como no base — a tabela de missões do Cassandra era redundante e some aqui.
- **`cagada.id`** é `String @id @default(uuid())` (em vez de timeuuid). Ordenação por recência usa `createdAt desc`.
- **503 quando o banco cai:** não se aplica do mesmo jeito — SQLite é embedded; falha de I/O vira 500. Mesma observação do base (polimento fora do MVP).

---

## Tasks REUSADAS do plano base (sem alteração)

Execute exatamente como descrito no plano base, **na ordem**, exceto onde substituído por uma task **[SQLITE]** abaixo:

- **[REUSO] Fase 1** (domínio `scoring.ts` + testes) — Task 1.1.
- **[REUSO] Fase 2** (catálogo + `MissionsService` + módulo) — Tasks 2.1, 2.2.
- **[REUSO] Task 4.2** (`UsersService`), **4.3** (`AuthService` + DTOs + testes), **4.4** (`JwtAuthGuard`), **4.5** (`AuthController` + `AuthModule`), **4.6** (`UsersController` + `UsersModule`, com `forwardRef`).
- **[REUSO] Task 5.2** (`CagadasService` + testes), **5.3** (DTO + controller + módulo), **5.4** (histórico no `GET /me`).
- **[REUSO] Task 6.2** (`FriendsService` + testes), **6.3** (controller + módulo).
- **[REUSO] Task 0.3** (`config/cassandra.config.ts`) — reaproveite o arquivo como está; os campos `cassandra.*` ficam **inertes** (não usados pelo Prisma). Se preferir, remova o bloco `cassandra` do objeto — nada mais o consome nesta variante.
- **[REUSO] Fase 8 inteira** (frontend: `lib/api.js`, `pages/login.js`, `pages/index.js`, `pages/amigos.js`).
- **[REUSO] Fase 9** (verificação final / checklist).

As tasks **substituídas** são: 0.1, 0.2 (infra/deps), 3.1 (módulo de banco), 4.1, 5.1, 6.1 (repositórios), e o _wiring_ do `AppModule` na 7.1.

---

## Fase 0 — Infra: Prisma + SQLite

### Task S0.1: Dependências e init do Prisma

**Files:**
- Modify: `backend/package.json` (via npm)
- Create: `backend/prisma/schema.prisma`
- Create/Modify: `backend/.env` (DATABASE_URL)

- [ ] **Step 1: Instalar deps** (de `backend/`)

Run:
```bash
npm i @prisma/client bcrypt @nestjs/jwt @nestjs/config class-validator class-transformer
npm i -D prisma @types/bcrypt
npx prisma init --datasource-provider sqlite
```
Expected: cria `backend/prisma/schema.prisma` e adiciona `DATABASE_URL` no `backend/.env`.

- [ ] **Step 2: Garantir o `.env`**

Confirme que `backend/.env` contém:
```
DATABASE_URL="file:./dev.db"
PORT=3001
JWT_SECRET=troque-este-segredo
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```
Confirme que `backend/.gitignore` ignora `.env` e `prisma/dev.db` (adicione `prisma/*.db` se faltar).

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/package.json backend/package-lock.json backend/prisma/schema.prisma backend/.gitignore
git commit -m "chore(backend): add prisma + sqlite deps and init"
```

### Task S0.2: Schema Prisma

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Escrever o schema**

```prisma
// backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  nickname     String   @id
  passwordHash String
  pcl          Int      @default(0)
  createdAt    DateTime @default(now())
  cagadas      Cagada[]
}

model Cagada {
  id          String    @id @default(uuid())
  nickname    String
  user        User      @relation(fields: [nickname], references: [nickname])
  missionId   String
  level       String
  missionText String
  status      String    @default("pendente")
  pclDelta    Int       @default(0)
  createdAt   DateTime  @default(now())
  resolvedAt  DateTime?

  @@index([nickname, createdAt])
}

model Friendship {
  ownerNick  String
  friendNick String
  createdAt  DateTime @default(now())

  @@id([ownerNick, friendNick])
}
```

- [ ] **Step 2: Rodar a migration (gera o client e o dev.db)**

Run: `npx prisma migrate dev --name init`
Expected: cria `backend/prisma/migrations/...`, o arquivo `dev.db`, e gera o `@prisma/client`.

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat(db): prisma schema and initial migration (sqlite)"
```

### Task S0.3: PrismaService + PrismaModule (substitui Task 3.1 do base)

**Files:**
- Create: `backend/src/prisma/prisma.service.ts`
- Create: `backend/src/prisma/prisma.module.ts`

- [ ] **Step 1: Criar o service**

```ts
// backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

- [ ] **Step 2: Criar o módulo global**

```ts
// backend/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila (o `@prisma/client` já foi gerado na migration).

- [ ] **Step 4: Commit** (peça permissão antes)

```bash
git add backend/src/prisma/
git commit -m "feat(db): global PrismaService and module"
```

---

## Fase 4/5/6 — Repositórios (substituem Tasks 4.1, 5.1, 6.1 do base)

### Task S4.1: UsersRepository (Prisma)

**Files:**
- Create: `backend/src/users/users.repository.ts`

- [ ] **Step 1: Criar o repositório** (mesma interface do base)

```ts
// backend/src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UserRow {
  nickname: string;
  password_hash: string;
  created_at: Date;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertUser(nickname: string, passwordHash: string): Promise<void> {
    await this.prisma.user.create({ data: { nickname, passwordHash, pcl: 0 } });
  }

  async findUser(nickname: string): Promise<UserRow | null> {
    const u = await this.prisma.user.findUnique({ where: { nickname } });
    if (!u) return null;
    return { nickname: u.nickname, password_hash: u.passwordHash, created_at: u.createdAt };
  }

  async getScore(nickname: string): Promise<number> {
    const u = await this.prisma.user.findUnique({ where: { nickname }, select: { pcl: true } });
    return u ? u.pcl : 0;
  }

  async setScore(nickname: string, pcl: number): Promise<void> {
    await this.prisma.user.update({ where: { nickname }, data: { pcl } });
  }
}
```

- [ ] **Step 2: Build** → `npm run build` → compila.
- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/src/users/users.repository.ts
git commit -m "feat(users): prisma repository"
```

### Task S5.1: CagadasRepository (Prisma)

**Files:**
- Create: `backend/src/cagadas/cagadas.repository.ts`

- [ ] **Step 1: Criar o repositório** (mesma interface/shape do base — snake_case nas rows)

```ts
// backend/src/cagadas/cagadas.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Missao } from '../missions/missions.catalog';

export interface CagadaRow {
  cagada_id: string;
  mission_id: string;
  level: string;
  mission_text: string;
  status: string;
  pcl_delta: number;
  created_at: Date;
  resolved_at: Date | null;
}

type CagadaRecord = {
  id: string;
  missionId: string;
  level: string;
  missionText: string;
  status: string;
  pclDelta: number;
  createdAt: Date;
  resolvedAt: Date | null;
};

function toRow(c: CagadaRecord): CagadaRow {
  return {
    cagada_id: c.id,
    mission_id: c.missionId,
    level: c.level,
    mission_text: c.missionText,
    status: c.status,
    pcl_delta: c.pclDelta,
    created_at: c.createdAt,
    resolved_at: c.resolvedAt,
  };
}

@Injectable()
export class CagadasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertPending(nickname: string, missao: Missao): Promise<string> {
    const c = await this.prisma.cagada.create({
      data: { nickname, missionId: missao.id, level: missao.level, missionText: missao.text },
    });
    return c.id;
  }

  async findById(nickname: string, cagadaId: string): Promise<CagadaRow | null> {
    const c = await this.prisma.cagada.findFirst({ where: { id: cagadaId, nickname } });
    return c ? toRow(c) : null;
  }

  async resolve(nickname: string, cagadaId: string, status: string, pclDelta: number): Promise<void> {
    await this.prisma.cagada.updateMany({
      where: { id: cagadaId, nickname },
      data: { status, pclDelta, resolvedAt: new Date() },
    });
  }

  async recent(nickname: string, limit = 10): Promise<CagadaRow[]> {
    const rows = await this.prisma.cagada.findMany({
      where: { nickname },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map(toRow);
  }
}
```

- [ ] **Step 2: Build** → `npm run build` → compila.
- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/src/cagadas/cagadas.repository.ts
git commit -m "feat(cagadas): prisma repository"
```

### Task S6.1: FriendsRepository (Prisma)

**Files:**
- Create: `backend/src/friends/friends.repository.ts`

- [ ] **Step 1: Criar o repositório** (idempotente via upsert)

```ts
// backend/src/friends/friends.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addMutual(a: string, b: string): Promise<void> {
    await this.upsertEdge(a, b);
    await this.upsertEdge(b, a);
  }

  private async upsertEdge(ownerNick: string, friendNick: string): Promise<void> {
    await this.prisma.friendship.upsert({
      where: { ownerNick_friendNick: { ownerNick, friendNick } },
      create: { ownerNick, friendNick },
      update: {},
    });
  }

  async listFriends(owner: string): Promise<string[]> {
    const rows = await this.prisma.friendship.findMany({ where: { ownerNick: owner } });
    return rows.map((r) => r.friendNick);
  }
}
```
> O nome composto `ownerNick_friendNick` é gerado automaticamente pelo Prisma a partir do `@@id([ownerNick, friendNick])`.

- [ ] **Step 2: Build** → `npm run build` → compila.
- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/src/friends/friends.repository.ts
git commit -m "feat(friends): prisma repository"
```

---

## Fase 7 — Bootstrap (substitui o wiring da Task 7.1 do base)

### Task S7.1: AppModule com PrismaModule

**Files:**
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/main.ts` (igual ao base — sem mudança real)

- [ ] **Step 1: AppModule**

```ts
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MissionsModule } from './missions/missions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CagadasModule } from './cagadas/cagadas.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MissionsModule,
    UsersModule,
    AuthModule,
    CagadasModule,
    FriendsModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 2: `main.ts`** — use exatamente o do base (Task 7.1, Step 2). Importa `loadConfig` de `./config/cassandra.config` (arquivo reusado). Nada de Cassandra é referenciado lá.

- [ ] **Step 3: Rodar testes unitários**

Run: `npm test`
Expected: PASS (scoring, missions.service, auth.service, cagadas.service, friends.service — todos com mocks, **sem banco**).

- [ ] **Step 4: Subir e fazer smoke** (não precisa de Docker!)

Run: `npm run start:dev`
Expected: app sobe na porta 3001 (SQLite cria/abre `dev.db` automaticamente). Rode o mesmo smoke de curl da Task 7.1 (Step 5) do base.

- [ ] **Step 5: Commit** (peça permissão antes)

```bash
git add backend/src/app.module.ts
git commit -m "feat(backend): wire PrismaModule into app"
```

---

## Fase 8 e 9 — REUSO total

Execute a **Fase 8** (frontend) e a **Fase 9** (verificação final) do plano base sem nenhuma alteração — elas não tocam na persistência.

---

## Self-review (cobertura)

- Auth, registrar/resolver cagada, PCL+piso, patentes, missões, amigos, ranking, `GET /me` com histórico → cobertos pelas tasks **[REUSO]** + repositórios Prisma equivalentes.
- Modelo de dados → schema Prisma (Users com `pcl`, Cagada, Friendship). Sem `missions`/`score` separados (justificado acima).
- Type consistency → `UserRow` e `CagadaRow` mantêm o mesmo shape (snake_case) que os _services_ do base consomem; assinaturas dos repositórios idênticas (`insertUser/findUser/getScore/setScore`, `insertPending/findById/resolve/recent`, `addMutual/listFriends`).
