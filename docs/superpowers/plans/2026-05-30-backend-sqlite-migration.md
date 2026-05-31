# Backend SQLite Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the backend's Cassandra persistence with the built-in `node:sqlite` module, dropping the `cassandra-driver` dependency and the Cassandra Docker service.

**Architecture:** A single `DatabaseService` owns one synchronous `node:sqlite` `DatabaseSync` connection, creates the relational schema idempotently at boot, and exposes thin `run`/`get`/`all` helpers. The three repositories keep their `Promise`-returning signatures (so services, controllers, and their tests are untouched) but call the synchronous helpers internally and wrap results in `Promise.resolve(...)`. During the migration both `CassandraModule` and `DatabaseModule` are registered so each commit compiles; a final cleanup task removes Cassandra entirely.

**Tech Stack:** NestJS 11, TypeScript (tsconfig `nodenext`, `recommendedTypeChecked` ESLint), `node:sqlite` (Node 24+), Jest + ts-jest, Docker (`node:24-slim`), yarn.

> **Project rule:** This repo requires explicit permission before any `git commit`. Treat each "Commit" step as "ask the user, then commit on approval."

---

## File Structure

**Create:**
- `backend/src/config/app.config.ts` — typed config loader (`port`, `database.file`, `jwt`). Replaces `cassandra.config.ts`.
- `backend/src/database/database.service.ts` — owns the `DatabaseSync` connection, bootstraps schema, exposes `run`/`get`/`all`.
- `backend/src/database/database.module.ts` — `@Global` module providing `DatabaseService`.
- `backend/src/database/database.service.spec.ts` — integration test of the service against an in-memory DB.
- `backend/src/users/users.repository.spec.ts`, `backend/src/cagadas/cagadas.repository.spec.ts`, `backend/src/friends/friends.repository.spec.ts` — repository integration tests against in-memory DBs.

**Modify:**
- `backend/src/app.module.ts` — swap `CassandraModule` → `DatabaseModule`.
- `backend/src/users/users.repository.ts`, `cagadas/cagadas.repository.ts`, `friends/friends.repository.ts` — use `DatabaseService` + SQLite SQL.
- `backend/src/main.ts`, `backend/src/auth/auth.module.ts` — import `loadConfig` from `app.config.ts`.
- `backend/src/app.module.spec.ts` — reword the Cassandra-referencing comment.
- `backend/package.json` — remove `cassandra-driver`.
- `backend/Dockerfile` — base `node:24-slim`.
- `backend/docker-compose.yml` — drop `cassandra`, add `backend-data` volume.
- `backend/.env`, `backend/.env.example`, `backend/.gitignore`, `backend/.dockerignore`.

**Delete:**
- `backend/src/cassandra/cassandra.service.ts`, `backend/src/cassandra/cassandra.module.ts`
- `backend/src/config/cassandra.config.ts`

> All commands below run from `backend/` unless noted.

---

## Task 1: Database layer (config + service + module), registered alongside Cassandra

**Files:**
- Create: `backend/src/config/app.config.ts`
- Create: `backend/src/database/database.service.ts`
- Create: `backend/src/database/database.module.ts`
- Modify: `backend/src/app.module.ts`
- Test: `backend/src/database/database.service.spec.ts`

- [ ] **Step 1: Create the config loader**

Create `backend/src/config/app.config.ts`:

```ts
export interface AppConfig {
  port: number;
  database: { file: string };
  jwt: { secret: string; expiresIn: string };
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT ?? '3001', 10),
    database: {
      file: process.env.DATABASE_FILE ?? './data/toilet_kpi.db',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
  };
}
```

- [ ] **Step 2: Create the DatabaseService**

Create `backend/src/database/database.service.ts`:

```ts
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { loadConfig } from '../config/app.config';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private db!: DatabaseSync;

  onModuleInit(): void {
    const file = loadConfig().database.file;
    if (file !== ':memory:') {
      mkdirSync(dirname(file), { recursive: true });
    }
    this.logger.log(`Abrindo banco SQLite em: ${file}`);
    this.db = new DatabaseSync(file);
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec('PRAGMA foreign_keys = ON');
    this.createTables();
    this.logger.log('Banco SQLite pronto.');
  }

  onModuleDestroy(): void {
    this.db?.close();
  }

  run(sql: string, params: SQLInputValue[] = []): void {
    this.db.prepare(sql).run(...params);
  }

  get<T>(sql: string, params: SQLInputValue[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as unknown as T | undefined;
  }

  all<T>(sql: string, params: SQLInputValue[] = []): T[] {
    return this.db.prepare(sql).all(...params) as unknown as T[];
  }

  private createTables(): void {
    const statements = [
      `CREATE TABLE IF NOT EXISTS users (
         nickname      TEXT PRIMARY KEY,
         password_hash TEXT NOT NULL,
         created_at    TEXT NOT NULL
       )`,
      `CREATE TABLE IF NOT EXISTS scores (
         nickname TEXT PRIMARY KEY,
         pcl      INTEGER NOT NULL DEFAULT 0,
         FOREIGN KEY (nickname) REFERENCES users(nickname)
       )`,
      `CREATE TABLE IF NOT EXISTS cagadas (
         id           TEXT PRIMARY KEY,
         nickname     TEXT NOT NULL,
         mission_id   TEXT NOT NULL,
         level        TEXT NOT NULL,
         mission_text TEXT NOT NULL,
         status       TEXT NOT NULL,
         pcl_delta    INTEGER NOT NULL DEFAULT 0,
         created_at   TEXT NOT NULL,
         resolved_at  TEXT,
         FOREIGN KEY (nickname) REFERENCES users(nickname)
       )`,
      `CREATE INDEX IF NOT EXISTS idx_cagadas_nickname ON cagadas(nickname)`,
      `CREATE TABLE IF NOT EXISTS friendships (
         owner_nick  TEXT NOT NULL,
         friend_nick TEXT NOT NULL,
         created_at  TEXT NOT NULL,
         PRIMARY KEY (owner_nick, friend_nick),
         FOREIGN KEY (owner_nick)  REFERENCES users(nickname),
         FOREIGN KEY (friend_nick) REFERENCES users(nickname)
       )`,
    ];
    for (const statement of statements) this.db.exec(statement);
  }
}
```

- [ ] **Step 3: Create the DatabaseModule**

Create `backend/src/database/database.module.ts`:

```ts
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

- [ ] **Step 4: Register DatabaseModule in AppModule (keep CassandraModule for now)**

In `backend/src/app.module.ts`, add the import near the other module imports:

```ts
import { DatabaseModule } from './database/database.module';
```

and add `DatabaseModule` to the `imports` array, immediately after `CassandraModule`:

```ts
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CassandraModule,
    DatabaseModule,
    MissionsModule,
    UsersModule,
    AuthModule,
    CagadasModule,
    FriendsModule,
  ],
```

- [ ] **Step 5: Write the failing test**

Create `backend/src/database/database.service.spec.ts`:

```ts
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let db: DatabaseService;

  beforeEach(() => {
    process.env.DATABASE_FILE = ':memory:';
    db = new DatabaseService();
    db.onModuleInit();
  });

  afterEach(() => {
    db.onModuleDestroy();
  });

  it('cria as tabelas e executa run/get/all', () => {
    db.run(
      `INSERT INTO users (nickname, password_hash, created_at) VALUES (?, ?, ?)`,
      ['zeca', 'hash', '2026-01-01T00:00:00.000Z'],
    );

    const row = db.get<{ nickname: string }>(
      `SELECT nickname FROM users WHERE nickname = ?`,
      ['zeca'],
    );
    expect(row?.nickname).toBe('zeca');

    const rows = db.all<{ nickname: string }>(`SELECT nickname FROM users`);
    expect(rows).toHaveLength(1);
  });

  it('cria todas as tabelas do schema', () => {
    const tables = db
      .all<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`,
      )
      .map((t) => t.name);
    expect(tables).toEqual(
      expect.arrayContaining(['cagadas', 'friendships', 'scores', 'users']),
    );
  });
});
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `yarn jest src/database/database.service.spec.ts`
Expected: PASS, 2 tests. (An `ExperimentalWarning: SQLite is an experimental feature` on stderr is normal.)

- [ ] **Step 7: Verify build and full suite**

Run: `yarn build`
Expected: compiles with no type errors.

Run: `yarn test`
Expected: all suites pass (existing specs + the new one).

- [ ] **Step 8: Commit**

```bash
git add src/config/app.config.ts src/database/ src/app.module.ts
git commit -m "feat(db): add node:sqlite DatabaseService alongside Cassandra"
```

Commit message must end with the trailer:
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

## Task 2: Migrate UsersRepository to SQLite

**Files:**
- Modify: `backend/src/users/users.repository.ts`
- Test: `backend/src/users/users.repository.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/src/users/users.repository.spec.ts`:

```ts
import { DatabaseService } from '../database/database.service';
import { UsersRepository } from './users.repository';

function makeRepo(): { repo: UsersRepository; db: DatabaseService } {
  process.env.DATABASE_FILE = ':memory:';
  const db = new DatabaseService();
  db.onModuleInit();
  return { repo: new UsersRepository(db), db };
}

describe('UsersRepository', () => {
  it('insere usuário com score zero e o encontra', async () => {
    const { repo, db } = makeRepo();
    await repo.insertUser('zeca', 'hash-123');

    const user = await repo.findUser('zeca');
    expect(user).toMatchObject({ nickname: 'zeca', password_hash: 'hash-123' });
    expect(user?.created_at).toBeInstanceOf(Date);
    expect(await repo.getScore('zeca')).toBe(0);

    db.onModuleDestroy();
  });

  it('devolve null para usuário inexistente e 0 de score', async () => {
    const { repo, db } = makeRepo();
    expect(await repo.findUser('ninguem')).toBeNull();
    expect(await repo.getScore('ninguem')).toBe(0);
    db.onModuleDestroy();
  });

  it('atualiza o score via upsert', async () => {
    const { repo, db } = makeRepo();
    await repo.insertUser('zeca', 'hash');
    await repo.setScore('zeca', 170);
    expect(await repo.getScore('zeca')).toBe(170);
    await repo.setScore('zeca', 200);
    expect(await repo.getScore('zeca')).toBe(200);
    db.onModuleDestroy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn jest src/users/users.repository.spec.ts`
Expected: FAIL — `UsersRepository` still depends on `CassandraService` (tables/queries don't match), e.g. `no such table: users_by_nick` or a constructor/DI mismatch.

- [ ] **Step 3: Rewrite the repository against SQLite**

Replace the entire contents of `backend/src/users/users.repository.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface UserRow {
  nickname: string;
  password_hash: string;
  created_at: Date;
}

interface RawUserRow {
  nickname: string;
  password_hash: string;
  created_at: string;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly database: DatabaseService) {}

  insertUser(nickname: string, passwordHash: string): Promise<void> {
    this.database.run(
      `INSERT INTO users (nickname, password_hash, created_at) VALUES (?, ?, ?)`,
      [nickname, passwordHash, new Date().toISOString()],
    );
    this.database.run(`INSERT INTO scores (nickname, pcl) VALUES (?, ?)`, [
      nickname,
      0,
    ]);
    return Promise.resolve();
  }

  findUser(nickname: string): Promise<UserRow | null> {
    const row = this.database.get<RawUserRow>(
      `SELECT nickname, password_hash, created_at FROM users WHERE nickname = ?`,
      [nickname],
    );
    const user = row
      ? {
          nickname: row.nickname,
          password_hash: row.password_hash,
          created_at: new Date(row.created_at),
        }
      : null;
    return Promise.resolve(user);
  }

  getScore(nickname: string): Promise<number> {
    const row = this.database.get<{ pcl: number }>(
      `SELECT pcl FROM scores WHERE nickname = ?`,
      [nickname],
    );
    return Promise.resolve(row ? Number(row.pcl) : 0);
  }

  setScore(nickname: string, pcl: number): Promise<void> {
    this.database.run(
      `INSERT INTO scores (nickname, pcl) VALUES (?, ?)
       ON CONFLICT(nickname) DO UPDATE SET pcl = excluded.pcl`,
      [nickname, pcl],
    );
    return Promise.resolve();
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn jest src/users/users.repository.spec.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Verify build and full suite**

Run: `yarn build` — Expected: no type errors.
Run: `yarn test` — Expected: all suites pass. (`CagadasRepository`/`FriendsRepository` still use `CassandraService`, which remains provided by `CassandraModule`, so the DI graph still resolves.)

- [ ] **Step 6: Commit**

```bash
git add src/users/users.repository.ts src/users/users.repository.spec.ts
git commit -m "feat(users): persist users and scores via SQLite"
```

Append the `Co-Authored-By` trailer as in Task 1.

---

## Task 3: Migrate CagadasRepository to SQLite

**Files:**
- Modify: `backend/src/cagadas/cagadas.repository.ts`
- Test: `backend/src/cagadas/cagadas.repository.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/src/cagadas/cagadas.repository.spec.ts`:

```ts
import { DatabaseService } from '../database/database.service';
import { UsersRepository } from '../users/users.repository';
import { CagadasRepository } from './cagadas.repository';
import { Missao } from '../missions/missions.catalog';

const missao: Missao = {
  id: 'insano-rio',
  level: 'insano',
  text: 'Lave-se no rio.',
};

async function makeRepo(): Promise<{
  repo: CagadasRepository;
  db: DatabaseService;
}> {
  process.env.DATABASE_FILE = ':memory:';
  const db = new DatabaseService();
  db.onModuleInit();
  await new UsersRepository(db).insertUser('zeca', 'hash');
  return { repo: new CagadasRepository(db), db };
}

describe('CagadasRepository', () => {
  it('insere cagada pendente e a recupera por id', async () => {
    const { repo, db } = await makeRepo();
    const id = await repo.insertPending('zeca', missao);
    expect(typeof id).toBe('string');

    const cagada = await repo.findById('zeca', id);
    expect(cagada).toMatchObject({
      cagada_id: id,
      mission_id: 'insano-rio',
      level: 'insano',
      mission_text: 'Lave-se no rio.',
      status: 'pendente',
      pcl_delta: 0,
    });
    expect(cagada?.created_at).toBeInstanceOf(Date);
    expect(cagada?.resolved_at).toBeNull();
    db.onModuleDestroy();
  });

  it('resolve a cagada atualizando status, delta e resolved_at', async () => {
    const { repo, db } = await makeRepo();
    const id = await repo.insertPending('zeca', missao);
    await repo.resolve('zeca', id, 'cumprida', 70);

    const cagada = await repo.findById('zeca', id);
    expect(cagada?.status).toBe('cumprida');
    expect(cagada?.pcl_delta).toBe(70);
    expect(cagada?.resolved_at).toBeInstanceOf(Date);
    db.onModuleDestroy();
  });

  it('lista as mais recentes primeiro', async () => {
    const { repo, db } = await makeRepo();
    const primeiro = await repo.insertPending('zeca', missao);
    const segundo = await repo.insertPending('zeca', missao);

    const recentes = await repo.recent('zeca', 10);
    expect(recentes.map((c) => c.cagada_id)).toEqual([segundo, primeiro]);
    db.onModuleDestroy();
  });

  it('null quando a cagada não é do usuário', async () => {
    const { repo, db } = await makeRepo();
    const id = await repo.insertPending('zeca', missao);
    expect(await repo.findById('outro', id)).toBeNull();
    db.onModuleDestroy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn jest src/cagadas/cagadas.repository.spec.ts`
Expected: FAIL — repository still uses `CassandraService`/`timeuuid` (e.g. `no such table: cagadas_by_user` or a `timeuuidNow` runtime error).

- [ ] **Step 3: Rewrite the repository against SQLite**

Replace the entire contents of `backend/src/cagadas/cagadas.repository.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
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

interface RawCagadaRow {
  id: string;
  mission_id: string;
  level: string;
  mission_text: string;
  status: string;
  pcl_delta: number;
  created_at: string;
  resolved_at: string | null;
}

@Injectable()
export class CagadasRepository {
  constructor(private readonly database: DatabaseService) {}

  private toCagada(row: RawCagadaRow): CagadaRow {
    return {
      cagada_id: row.id,
      mission_id: row.mission_id,
      level: row.level,
      mission_text: row.mission_text,
      status: row.status,
      pcl_delta: Number(row.pcl_delta),
      created_at: new Date(row.created_at),
      resolved_at: row.resolved_at ? new Date(row.resolved_at) : null,
    };
  }

  insertPending(nickname: string, missao: Missao): Promise<string> {
    const id = randomUUID();
    this.database.run(
      `INSERT INTO cagadas
         (id, nickname, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at)
       VALUES (?, ?, ?, ?, ?, 'pendente', 0, ?, NULL)`,
      [id, nickname, missao.id, missao.level, missao.text, new Date().toISOString()],
    );
    return Promise.resolve(id);
  }

  findById(nickname: string, cagadaId: string): Promise<CagadaRow | null> {
    const row = this.database.get<RawCagadaRow>(
      `SELECT id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at
         FROM cagadas WHERE nickname = ? AND id = ?`,
      [nickname, cagadaId],
    );
    return Promise.resolve(row ? this.toCagada(row) : null);
  }

  resolve(
    nickname: string,
    cagadaId: string,
    status: string,
    pclDelta: number,
  ): Promise<void> {
    this.database.run(
      `UPDATE cagadas SET status = ?, pcl_delta = ?, resolved_at = ?
         WHERE nickname = ? AND id = ?`,
      [status, pclDelta, new Date().toISOString(), nickname, cagadaId],
    );
    return Promise.resolve();
  }

  recent(nickname: string, limit = 10): Promise<CagadaRow[]> {
    const rows = this.database.all<RawCagadaRow>(
      `SELECT id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at
         FROM cagadas WHERE nickname = ? ORDER BY rowid DESC LIMIT ?`,
      [nickname, limit],
    );
    return Promise.resolve(rows.map((row) => this.toCagada(row)));
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn jest src/cagadas/cagadas.repository.spec.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Verify build and full suite**

Run: `yarn build` — Expected: no type errors.
Run: `yarn test` — Expected: all suites pass (including the existing `cagadas.service.spec.ts`, which mocks the repository).

- [ ] **Step 6: Commit**

```bash
git add src/cagadas/cagadas.repository.ts src/cagadas/cagadas.repository.spec.ts
git commit -m "feat(cagadas): persist cagadas via SQLite with uuid ids"
```

Append the `Co-Authored-By` trailer.

---

## Task 4: Migrate FriendsRepository to SQLite

**Files:**
- Modify: `backend/src/friends/friends.repository.ts`
- Test: `backend/src/friends/friends.repository.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/src/friends/friends.repository.spec.ts`:

```ts
import { DatabaseService } from '../database/database.service';
import { UsersRepository } from '../users/users.repository';
import { FriendsRepository } from './friends.repository';

async function makeRepo(): Promise<{
  repo: FriendsRepository;
  db: DatabaseService;
}> {
  process.env.DATABASE_FILE = ':memory:';
  const db = new DatabaseService();
  db.onModuleInit();
  const users = new UsersRepository(db);
  await users.insertUser('zeca', 'hash');
  await users.insertUser('amigo', 'hash');
  return { repo: new FriendsRepository(db), db };
}

describe('FriendsRepository', () => {
  it('adiciona amizade mútua visível dos dois lados', async () => {
    const { repo, db } = await makeRepo();
    await repo.addMutual('zeca', 'amigo');

    expect(await repo.listFriends('zeca')).toEqual(['amigo']);
    expect(await repo.listFriends('amigo')).toEqual(['zeca']);
    db.onModuleDestroy();
  });

  it('é idempotente: adicionar duas vezes não duplica', async () => {
    const { repo, db } = await makeRepo();
    await repo.addMutual('zeca', 'amigo');
    await repo.addMutual('zeca', 'amigo');

    expect(await repo.listFriends('zeca')).toEqual(['amigo']);
    db.onModuleDestroy();
  });

  it('lista vazia quando não há amigos', async () => {
    const { repo, db } = await makeRepo();
    expect(await repo.listFriends('zeca')).toEqual([]);
    db.onModuleDestroy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn jest src/friends/friends.repository.spec.ts`
Expected: FAIL — repository still queries `friendships_by_user` via `CassandraService` (e.g. `no such table: friendships_by_user`).

- [ ] **Step 3: Rewrite the repository against SQLite**

Replace the entire contents of `backend/src/friends/friends.repository.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FriendsRepository {
  constructor(private readonly database: DatabaseService) {}

  addMutual(nickname: string, friendNickname: string): Promise<void> {
    const now = new Date().toISOString();
    this.database.run(
      `INSERT OR IGNORE INTO friendships (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)`,
      [nickname, friendNickname, now],
    );
    this.database.run(
      `INSERT OR IGNORE INTO friendships (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)`,
      [friendNickname, nickname, now],
    );
    return Promise.resolve();
  }

  listFriends(owner: string): Promise<string[]> {
    const rows = this.database.all<{ friend_nick: string }>(
      `SELECT friend_nick FROM friendships WHERE owner_nick = ?`,
      [owner],
    );
    return Promise.resolve(rows.map((row) => row.friend_nick));
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn jest src/friends/friends.repository.spec.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Verify build and full suite**

Run: `yarn build` — Expected: no type errors.
Run: `yarn test` — Expected: all suites pass.

- [ ] **Step 6: Commit**

```bash
git add src/friends/friends.repository.ts src/friends/friends.repository.spec.ts
git commit -m "feat(friends): persist friendships via SQLite"
```

Append the `Co-Authored-By` trailer.

---

## Task 5: Remove Cassandra entirely

**Files:**
- Modify: `backend/src/app.module.ts`, `backend/src/main.ts`, `backend/src/auth/auth.module.ts`, `backend/src/app.module.spec.ts`, `backend/package.json`
- Delete: `backend/src/cassandra/cassandra.service.ts`, `backend/src/cassandra/cassandra.module.ts`, `backend/src/config/cassandra.config.ts`

- [ ] **Step 1: Point the two config importers at app.config**

In `backend/src/main.ts`, change the import line:

```ts
import { loadConfig } from './config/cassandra.config';
```
to:
```ts
import { loadConfig } from './config/app.config';
```

In `backend/src/auth/auth.module.ts`, change:

```ts
import { loadConfig } from '../config/cassandra.config';
```
to:
```ts
import { loadConfig } from '../config/app.config';
```

- [ ] **Step 2: Drop CassandraModule from AppModule**

In `backend/src/app.module.ts`, remove the import line `import { CassandraModule } from './cassandra/cassandra.module';` and remove `CassandraModule,` from the `imports` array. The imports array becomes:

```ts
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MissionsModule,
    UsersModule,
    AuthModule,
    CagadasModule,
    FriendsModule,
  ],
```

- [ ] **Step 3: Reword the wiring test comment**

In `backend/src/app.module.spec.ts`, change the test title from
`'resolve o grafo de dependências sem conectar ao Cassandra'`
to
`'resolve o grafo de dependências sem abrir o banco'`.
Leave the test body unchanged.

- [ ] **Step 4: Delete the Cassandra source files**

```bash
git rm src/cassandra/cassandra.service.ts src/cassandra/cassandra.module.ts src/config/cassandra.config.ts
```

- [ ] **Step 5: Remove the cassandra-driver dependency**

Run: `yarn remove cassandra-driver`
Expected: `package.json` no longer lists `cassandra-driver`; `yarn.lock` is updated.

- [ ] **Step 6: Verify no Cassandra references remain**

Run: `git grep -i cassandra -- src` (from `backend/`)
Expected: no output.

Run: `git grep -n "cassandra-driver" -- package.json`
Expected: no output.

- [ ] **Step 7: Verify build, lint, and full suite**

Run: `yarn build` — Expected: no type errors.
Run: `yarn lint` — Expected: completes with no errors.
Run: `yarn test` — Expected: all suites pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: remove Cassandra and cassandra-driver"
```

Append the `Co-Authored-By` trailer.

---

## Task 6: Docker and environment

**Files:**
- Modify: `backend/Dockerfile`, `backend/docker-compose.yml`, `backend/.env`, `backend/.env.example`, `backend/.gitignore`, `backend/.dockerignore`

- [ ] **Step 1: Bump the Docker base image to Node 24**

In `backend/Dockerfile`, change the base stage line:

```dockerfile
FROM node:22-slim AS base
```
to:
```dockerfile
FROM node:24-slim AS base
```

and update the comment block above it to:

```dockerfile
# ===== base =====================================================
# Debian slim (não-musl) para preservar a compilação nativa do bcrypt.
# Node 24: node:sqlite (módulo nativo) disponível sem flag.
```

Leave all other stages unchanged.

- [ ] **Step 2: Replace docker-compose.yml**

Replace the entire contents of `backend/docker-compose.yml`:

```yaml
name: toilet-kpi

services:
  backend:
    build:
      context: ./
      target: prod
    container_name: toilet-kpi-backend
    env_file:
      - .env
    environment:
      - DATABASE_FILE=/app/data/toilet_kpi.db
    ports:
      - "3001:3001"
    volumes:
      - backend-data:/app/data
    restart: unless-stopped
    networks:
      - toilet-kpi-net

volumes:
  backend-data:

networks:
  toilet-kpi-net:
    driver: bridge
```

- [ ] **Step 3: Update .env.example**

Replace the entire contents of `backend/.env.example`:

```bash
# backend/.env.example
PORT=3001
DATABASE_FILE=./data/toilet_kpi.db
JWT_SECRET=troque-este-segredo-em-producao
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

- [ ] **Step 4: Update .env**

Replace the entire contents of `backend/.env` (the local file consumed by docker-compose):

```bash
# backend/.env
PORT=3001
DATABASE_FILE=./data/toilet_kpi.db
JWT_SECRET=troque-este-segredo-em-producao
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

(`docker-compose.yml` overrides `DATABASE_FILE` to `/app/data/toilet_kpi.db` for the container; the value here is for local `node`/`yarn` runs.)

- [ ] **Step 5: Ignore the local SQLite files**

Append to `backend/.gitignore`:

```
# SQLite database
/data
*.db
*.db-*
```

Append to `backend/.dockerignore`:

```
data
*.db
*.db-*
```

- [ ] **Step 6: Verify the production image builds and boots**

Run: `docker compose build`
Expected: build succeeds on `node:24-slim`.

Run: `docker compose up -d`
Expected: only `toilet-kpi-backend` starts (no Cassandra service).

Run: `docker compose logs backend`
Expected: logs include `Abrindo banco SQLite em: /app/data/toilet_kpi.db` and `Banco SQLite pronto.`, with no Cassandra connection attempts.

Run: `docker compose down`
Expected: container stops; the `backend-data` volume persists.

> If Docker is unavailable in the execution environment, skip Step 6 and note it as not executed.

- [ ] **Step 7: Commit**

```bash
git add Dockerfile docker-compose.yml .env.example .gitignore .dockerignore
git commit -m "build: run backend on node:24-slim with SQLite volume, drop Cassandra service"
```

(`.env` is git-ignored and is not committed.) Append the `Co-Authored-By` trailer.

---

## Self-Review

**Spec coverage:**
- Remove `cassandra-driver` / no driver imports → Task 5 (steps 4–6).
- `node:sqlite` `DatabaseService`, idempotent schema, no mission seed → Task 1.
- Clean relational tables (`users`/`scores`/`cagadas`/`friendships`), dropped `missions` → Task 1 schema.
- `crypto.randomUUID()` cagada id, `recent` by `rowid DESC` → Task 3.
- Config rename to `app.config.ts` + `DATABASE_FILE` → Tasks 1 & 5.
- `node:24-slim`, bcrypt unchanged → Task 6 step 1.
- Persist via named volume → Task 6 step 2.
- `.env`/`.env.example`/ignore files → Task 6 steps 3–5.
- `app.module.spec` comment → Task 5 step 3.
- Build green / suite green / fluxos preserved → verification steps in every task + Task 5 step 7.

**Placeholder scan:** No TBD/TODO; every code step has complete code; every command has expected output.

**Type consistency:** `DatabaseService.run/get/all(sql, params: SQLInputValue[])` used consistently by all three repos. `RawUserRow`/`RawCagadaRow` (string timestamps) map to `UserRow`/`CagadaRow` (`Date`). `CagadaRow.cagada_id` ← row `id`; `toCagada` consumes `RawCagadaRow`. `loadConfig()` returns `{ port, database: { file }, jwt }`, matching `main.ts` (`config.port`) and `auth.module.ts` (`loadConfig().jwt`).
