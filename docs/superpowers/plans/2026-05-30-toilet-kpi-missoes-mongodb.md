# Toilet KPI — Missões por Cagada (MVP) — Variante MongoDB + Mongoose

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Mesmo MVP do Toilet KPI, porém persistindo em **MongoDB via @nestjs/mongoose**.

**Architecture:** Idêntica ao plano base, trocando a camada de persistência. Os _services_, controllers, DTOs, domínio, missões e frontend são **reaproveitados sem alteração** do plano base, porque os repositórios mantêm exatamente as mesmas assinaturas. Só mudam: infra (Phase 0), o módulo de banco (Mongoose no lugar do Cassandra) e os 3 repositórios.

**Tech Stack:** NestJS 11, @nestjs/mongoose + mongoose + MongoDB 7 (Docker), bcrypt, @nestjs/jwt; Next.js 16 + React 19; Jest.

---

## ⚠️ Regras e leitura obrigatória

1. **NÃO commitar sem permissão expressa do usuário.** Peça antes de cada `git commit`.
2. **Este plano é um _delta_ do plano base** `docs/superpowers/plans/2026-05-30-toilet-kpi-missoes.md`. Tenha-o à mão: as tasks **[REUSO]** usam o código **exato** do plano base.
3. **Next.js 16** — leia os docs locais antes do frontend (igual ao base).
4. Comandos de backend rodam de `backend/`; frontend de `frontend/`.

## Diferenças de modelagem vs. spec/Cassandra

- **Sem coleção `score` separada:** o `pcl` vira um campo no documento `User` (number, default 0). `getScore`/`setScore` leem/escrevem `User.pcl`. O piso em 0 continua na lógica de domínio.
- **Sem coleção `missions`:** catálogo só em código + sorteio em memória (igual ao base).
- **`cagada.id`** é o `_id` (ObjectId) convertido para string. Ordenação por recência via `createdAt: -1`.
- **Registro de models global:** um `DatabaseModule` `@Global` registra os schemas com `forFeature` e re-exporta o `MongooseModule`, para que os repositórios injetem os models em qualquer lugar **sem** alterar os módulos reusados (Users/Cagadas/Friends).
- **503 quando o banco cai (spec §13):** não implementado (mesma observação do base — polimento fora do MVP).

---

## Tasks REUSADAS do plano base (sem alteração)

Execute exatamente como no plano base, exceto onde substituído por uma task **[MONGO]**:

- **[REUSO] Fase 1** (domínio + testes) — 1.1.
- **[REUSO] Fase 2** (catálogo + `MissionsService` + módulo) — 2.1, 2.2.
- **[REUSO] Task 4.2** (`UsersService`), **4.3** (`AuthService` + DTOs + testes), **4.4** (`JwtAuthGuard`), **4.5** (`AuthController` + `AuthModule`), **4.6** (`UsersController` + `UsersModule`).
- **[REUSO] Task 5.2** (`CagadasService` + testes), **5.3** (DTO + controller + módulo), **5.4** (histórico no `GET /me`).
- **[REUSO] Task 6.2** (`FriendsService` + testes), **6.3** (controller + módulo).
- **[REUSO] Task 0.3** (`config/cassandra.config.ts`) — reaproveite; os campos `cassandra.*` ficam inertes.
- **[REUSO] Fase 8** (frontend completo) e **Fase 9** (verificação).

Substituídas: 0.1, 0.2 (infra/deps), 3.1 (módulo de banco + schemas), 4.1, 5.1, 6.1 (repositórios), e o _wiring_ do `AppModule` na 7.1.

---

## Fase 0 — Infra: MongoDB + Mongoose

### Task M0.1: MongoDB local via Docker

**Files:**
- Create: `docker-compose.mongo.yml` (raiz do repo)

> Use um arquivo separado para **não conflitar** com o `docker-compose.yml` do plano Cassandra.

- [ ] **Step 1: Criar o compose**

```yaml
services:
  mongo:
    image: mongo:7
    container_name: toilet-kpi-mongo
    ports:
      - "27017:27017"
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 12
```

- [ ] **Step 2: Subir**

Run: `docker compose -f docker-compose.mongo.yml up -d`
Then: `docker compose -f docker-compose.mongo.yml ps`
Expected: `mongo` com status `healthy`.

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add docker-compose.mongo.yml
git commit -m "chore: add local MongoDB via docker-compose"
```

### Task M0.2: Dependências e env

**Files:**
- Modify: `backend/package.json` (via npm)
- Modify: `backend/.env`

- [ ] **Step 1: Instalar deps** (de `backend/`)

Run:
```bash
npm i @nestjs/mongoose mongoose bcrypt @nestjs/jwt @nestjs/config class-validator class-transformer
npm i -D @types/bcrypt
```

- [ ] **Step 2: Garantir o `.env`**

```
MONGO_URI=mongodb://localhost:27017/toilet_kpi
PORT=3001
JWT_SECRET=troque-este-segredo
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```
Confirme que `backend/.gitignore` ignora `.env`.

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/package.json backend/package-lock.json
git commit -m "chore(backend): add mongoose deps"
```

### Task M0.3: Schemas + DatabaseModule (substitui Task 3.1 do base)

**Files:**
- Create: `backend/src/database/schemas/user.schema.ts`
- Create: `backend/src/database/schemas/cagada.schema.ts`
- Create: `backend/src/database/schemas/friendship.schema.ts`
- Create: `backend/src/database/database.module.ts`

- [ ] **Step 1: Schema User**

```ts
// backend/src/database/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User {
  @Prop({ required: true, unique: true })
  nickname!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ default: 0 })
  pcl!: number;

  @Prop({ default: () => new Date() })
  createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

- [ ] **Step 2: Schema Cagada**

```ts
// backend/src/database/schemas/cagada.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CagadaDocument = HydratedDocument<Cagada>;

@Schema({ collection: 'cagadas' })
export class Cagada {
  @Prop({ required: true, index: true })
  nickname!: string;

  @Prop({ required: true })
  missionId!: string;

  @Prop({ required: true })
  level!: string;

  @Prop({ required: true })
  missionText!: string;

  @Prop({ default: 'pendente' })
  status!: string;

  @Prop({ default: 0 })
  pclDelta!: number;

  @Prop({ default: () => new Date() })
  createdAt!: Date;

  @Prop({ default: null, type: Date })
  resolvedAt!: Date | null;
}

export const CagadaSchema = SchemaFactory.createForClass(Cagada);
```

- [ ] **Step 3: Schema Friendship**

```ts
// backend/src/database/schemas/friendship.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FriendshipDocument = HydratedDocument<Friendship>;

@Schema({ collection: 'friendships' })
export class Friendship {
  @Prop({ required: true })
  ownerNick!: string;

  @Prop({ required: true })
  friendNick!: string;

  @Prop({ default: () => new Date() })
  createdAt!: Date;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);
FriendshipSchema.index({ ownerNick: 1, friendNick: 1 }, { unique: true });
```

- [ ] **Step 4: DatabaseModule global (registra os models para injeção em qualquer lugar)**

```ts
// backend/src/database/database.module.ts
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Cagada, CagadaSchema } from './schemas/cagada.schema';
import { Friendship, FriendshipSchema } from './schemas/friendship.schema';

const features = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
  { name: Cagada.name, schema: CagadaSchema },
  { name: Friendship.name, schema: FriendshipSchema },
]);

@Global()
@Module({
  imports: [features],
  exports: [features],
})
export class DatabaseModule {}
```

- [ ] **Step 5: Build** → `npm run build` → compila.
- [ ] **Step 6: Commit** (peça permissão antes)

```bash
git add backend/src/database/
git commit -m "feat(db): mongoose schemas and global database module"
```

---

## Fase 4/5/6 — Repositórios (substituem Tasks 4.1, 5.1, 6.1 do base)

### Task M4.1: UsersRepository (Mongoose)

**Files:**
- Create: `backend/src/users/users.repository.ts`

- [ ] **Step 1: Criar o repositório** (mesma interface do base)

```ts
// backend/src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';

export interface UserRow {
  nickname: string;
  password_hash: string;
  created_at: Date;
}

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async insertUser(nickname: string, passwordHash: string): Promise<void> {
    await this.userModel.create({ nickname, passwordHash, pcl: 0 });
  }

  async findUser(nickname: string): Promise<UserRow | null> {
    const u = await this.userModel.findOne({ nickname }).lean();
    if (!u) return null;
    return { nickname: u.nickname, password_hash: u.passwordHash, created_at: u.createdAt };
  }

  async getScore(nickname: string): Promise<number> {
    const u = await this.userModel.findOne({ nickname }).select('pcl').lean();
    return u ? u.pcl : 0;
  }

  async setScore(nickname: string, pcl: number): Promise<void> {
    await this.userModel.updateOne({ nickname }, { $set: { pcl } });
  }
}
```

- [ ] **Step 2: Build** → `npm run build` → compila.
- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/src/users/users.repository.ts
git commit -m "feat(users): mongoose repository"
```

### Task M5.1: CagadasRepository (Mongoose)

**Files:**
- Create: `backend/src/cagadas/cagadas.repository.ts`

- [ ] **Step 1: Criar o repositório** (mesmo shape de row do base — snake_case)

```ts
// backend/src/cagadas/cagadas.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Cagada, CagadaDocument } from '../database/schemas/cagada.schema';
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

type LeanCagada = {
  _id: unknown;
  missionId: string;
  level: string;
  missionText: string;
  status: string;
  pclDelta: number;
  createdAt: Date;
  resolvedAt: Date | null;
};

function toRow(c: LeanCagada): CagadaRow {
  return {
    cagada_id: String(c._id),
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
  constructor(@InjectModel(Cagada.name) private readonly model: Model<CagadaDocument>) {}

  async insertPending(nickname: string, missao: Missao): Promise<string> {
    const c = await this.model.create({
      nickname,
      missionId: missao.id,
      level: missao.level,
      missionText: missao.text,
    });
    return String(c._id);
  }

  async findById(nickname: string, cagadaId: string): Promise<CagadaRow | null> {
    if (!isValidObjectId(cagadaId)) return null;
    const c = await this.model.findOne({ _id: cagadaId, nickname }).lean<LeanCagada>();
    return c ? toRow(c) : null;
  }

  async resolve(nickname: string, cagadaId: string, status: string, pclDelta: number): Promise<void> {
    if (!isValidObjectId(cagadaId)) return;
    await this.model.updateOne(
      { _id: cagadaId, nickname },
      { $set: { status, pclDelta, resolvedAt: new Date() } },
    );
  }

  async recent(nickname: string, limit = 10): Promise<CagadaRow[]> {
    const rows = await this.model
      .find({ nickname })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<LeanCagada[]>();
    return rows.map(toRow);
  }
}
```

- [ ] **Step 2: Build** → `npm run build` → compila.
- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/src/cagadas/cagadas.repository.ts
git commit -m "feat(cagadas): mongoose repository"
```

### Task M6.1: FriendsRepository (Mongoose)

**Files:**
- Create: `backend/src/friends/friends.repository.ts`

- [ ] **Step 1: Criar o repositório** (idempotente via upsert)

```ts
// backend/src/friends/friends.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Friendship, FriendshipDocument } from '../database/schemas/friendship.schema';

@Injectable()
export class FriendsRepository {
  constructor(@InjectModel(Friendship.name) private readonly model: Model<FriendshipDocument>) {}

  async addMutual(a: string, b: string): Promise<void> {
    await this.upsertEdge(a, b);
    await this.upsertEdge(b, a);
  }

  private async upsertEdge(ownerNick: string, friendNick: string): Promise<void> {
    await this.model.updateOne(
      { ownerNick, friendNick },
      { $setOnInsert: { ownerNick, friendNick, createdAt: new Date() } },
      { upsert: true },
    );
  }

  async listFriends(owner: string): Promise<string[]> {
    const rows = await this.model.find({ ownerNick: owner }).lean();
    return rows.map((r) => r.friendNick);
  }
}
```

- [ ] **Step 2: Build** → `npm run build` → compila.
- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/src/friends/friends.repository.ts
git commit -m "feat(friends): mongoose repository"
```

---

## Fase 7 — Bootstrap (substitui o wiring da Task 7.1 do base)

### Task M7.1: AppModule com Mongoose

**Files:**
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/main.ts` (igual ao base — sem mudança real)

- [ ] **Step 1: AppModule**

```ts
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { MissionsModule } from './missions/missions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CagadasModule } from './cagadas/cagadas.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/toilet_kpi'),
    DatabaseModule,
    MissionsModule,
    UsersModule,
    AuthModule,
    CagadasModule,
    FriendsModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 2: `main.ts`** — use exatamente o do base (Task 7.1, Step 2). Importa `loadConfig` de `./config/cassandra.config` (reusado); nada de Cassandra é referenciado lá.

- [ ] **Step 3: Rodar testes unitários**

Run: `npm test`
Expected: PASS (todos com mocks, **sem banco**).

- [ ] **Step 4: Subir e fazer smoke** (com o Mongo do Docker de pé)

Run: `npm run start:dev`
Expected: app conecta no Mongo e sobe na porta 3001. Rode o smoke de curl da Task 7.1 (Step 5) do base.

- [ ] **Step 5: Commit** (peça permissão antes)

```bash
git add backend/src/app.module.ts
git commit -m "feat(backend): wire Mongoose into app"
```

---

## Fase 8 e 9 — REUSO total

Execute a **Fase 8** (frontend) e a **Fase 9** (verificação) do plano base sem alteração.

---

## Self-review (cobertura)

- Auth, registrar/resolver cagada, PCL+piso, patentes, missões, amigos, ranking, `GET /me` com histórico → cobertos pelas tasks **[REUSO]** + repositórios Mongoose equivalentes.
- Modelo de dados → schemas Mongoose (User com `pcl`, Cagada, Friendship com índice único composto). Sem coleções `missions`/`score` separadas (justificado acima).
- Type consistency → `UserRow` e `CagadaRow` mantêm o mesmo shape (snake_case) consumido pelos _services_ do base; assinaturas dos repositórios idênticas às do base.
- Injeção global dos models → `DatabaseModule` `@Global` re-exporta `MongooseModule.forFeature(...)`, então os módulos reusados (Users/Cagadas/Friends) **não precisam mudar**.
