# Toilet KPI — Missões por Cagada (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o MVP do Toilet KPI: o usuário loga (nickname+senha), registra uma "cagada", recebe uma missão absurda aleatória, marca o resultado e ganha/perde Pontos de Cu Limpo (PCL) que definem sua patente; mais amigos e ranking.

**Architecture:** Backend NestJS 11 (REST) com módulos leves (Cassandra, Domain/Scoring, Missions, Users, Auth, Cagadas, Friends). Lógica de pontuação/patente em funções puras testáveis. Persistência em Cassandra modelada a partir das queries. Frontend Next.js 16 (Pages Router, JS) client-rendered consumindo a API via `fetch` com JWT.

**Tech Stack:** NestJS 11, cassandra-driver, bcrypt, @nestjs/jwt, @nestjs/config, class-validator; Next.js 16 + React 19; Cassandra 5 (Docker); Jest + Supertest.

---

## ⚠️ Regras e avisos antes de começar

1. **NÃO commitar sem permissão expressa do usuário.** Este plano contém passos `git commit` (prática TDD). **Antes de executá-los, peça permissão explícita** OU peça ao usuário uma autorização geral ("pode commitar a cada task") no início da execução. Não commite por conta própria.
2. **Next.js 16 é diferente do que você conhece.** O arquivo `frontend/AGENTS.md` avisa que esta versão tem breaking changes. **Antes de escrever qualquer código de frontend (Fase 6), leia os docs locais** em `frontend/node_modules/next/dist/docs/` (Pages Router, data fetching, env vars). O frontend deste plano é deliberadamente client-rendered (sem `getServerSideProps`) para ser robusto a mudanças de versão — confirme que os hooks/imports usados batem com a versão instalada.
3. **Comandos de backend** rodam a partir de `backend/`. **Comandos de frontend** a partir de `frontend/`.
4. **Cassandra precisa estar de pé** para testes de integração/e2e e para rodar o app (Fase 0 sobe via Docker).

## Desvios conscientes em relação ao spec

- **`score_by_nick.pcl` é `int`, não `counter`.** O spec sugeriu `counter`, mas a regra "PCL nunca fica negativo (piso em 0)" exige read-modify-write com `Math.max(0, ...)`, e counters do Cassandra não suportam piso condicional. Usamos coluna `int` com leitura-modificação-escrita. Para um app de 1 usuário por conta, a corrida de escrita concorrente é desprezível (aceita no MVP). A estrutura de tabelas do spec é mantida no resto.

---

## Mapa de arquivos

**Backend (`backend/`):**
- `docker-compose.yml` (raiz do repo) — Cassandra local.
- `backend/.env.example` — variáveis de ambiente.
- `backend/src/config/cassandra.config.ts` — leitura tipada das env de Cassandra/JWT.
- `backend/src/cassandra/cassandra.service.ts` — conexão, bootstrap de keyspace/tabelas, seed de missões.
- `backend/src/cassandra/cassandra.module.ts` — módulo global do Cassandra.
- `backend/src/domain/scoring.ts` + `scoring.spec.ts` — constantes e funções puras (PCL, patente).
- `backend/src/missions/missions.catalog.ts` — pool curado de missões.
- `backend/src/missions/missions.service.ts` + `.spec.ts` — sorteio.
- `backend/src/missions/missions.module.ts`
- `backend/src/users/users.repository.ts` — `users_by_nick` + `score_by_nick`.
- `backend/src/users/users.service.ts` — identidade, score, patente.
- `backend/src/users/users.controller.ts` — `GET /me`.
- `backend/src/users/users.module.ts`
- `backend/src/auth/dto/{register,login}.dto.ts`
- `backend/src/auth/auth.service.ts` + `.spec.ts`
- `backend/src/auth/jwt-auth.guard.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.module.ts`
- `backend/src/cagadas/cagadas.repository.ts` — `cagadas_by_user`.
- `backend/src/cagadas/dto/resolver.dto.ts`
- `backend/src/cagadas/cagadas.service.ts` + `.spec.ts`
- `backend/src/cagadas/cagadas.controller.ts`
- `backend/src/cagadas/cagadas.module.ts`
- `backend/src/friends/friends.repository.ts` — `friendships_by_user`.
- `backend/src/friends/friends.service.ts` + `.spec.ts`
- `backend/src/friends/friends.controller.ts`
- `backend/src/friends/friends.module.ts`
- `backend/src/app.module.ts` (modificar) · `backend/src/main.ts` (modificar)

**Frontend (`frontend/`):**
- `frontend/.env.local.example`
- `frontend/lib/api.js` — wrapper de `fetch` + token.
- `frontend/pages/login.js` · `frontend/pages/index.js` (substitui boilerplate) · `frontend/pages/amigos.js`

---

## Fase 0 — Infraestrutura

### Task 0.1: Cassandra local via Docker

**Files:**
- Create: `docker-compose.yml` (raiz do repo)

- [ ] **Step 1: Criar o compose**

```yaml
services:
  cassandra:
    image: cassandra:5
    container_name: toilet-kpi-cassandra
    ports:
      - "9042:9042"
    environment:
      - CASSANDRA_DC=datacenter1
      - CASSANDRA_ENDPOINT_SNITCH=GossipingPropertyFileSnitch
    healthcheck:
      test: ["CMD", "cqlsh", "-e", "describe keyspaces"]
      interval: 15s
      timeout: 10s
      retries: 12
```

- [ ] **Step 2: Subir e aguardar ficar saudável**

Run: `docker compose up -d`
Then: `docker compose ps`
Expected: serviço `cassandra` com status `healthy` (pode levar ~1–2 min na primeira vez).

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add docker-compose.yml
git commit -m "chore: add local Cassandra via docker-compose"
```

### Task 0.2: Dependências do backend e variáveis de ambiente

**Files:**
- Modify: `backend/package.json` (via npm)
- Create: `backend/.env.example`

- [ ] **Step 1: Instalar dependências** (a partir de `backend/`)

Run:
```bash
npm i cassandra-driver bcrypt @nestjs/jwt @nestjs/config class-validator class-transformer
npm i -D @types/bcrypt
```
Expected: instala sem erros; `package.json` atualizado.

- [ ] **Step 2: Criar `.env.example`**

```bash
# backend/.env.example
PORT=3001
CASSANDRA_CONTACT_POINTS=127.0.0.1
CASSANDRA_LOCAL_DC=datacenter1
CASSANDRA_KEYSPACE=toilet_kpi
JWT_SECRET=troque-este-segredo-em-producao
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

- [ ] **Step 3: Criar o `.env` real** (copie e ajuste)

Run: `cp backend/.env.example backend/.env`  (Windows PowerShell: `Copy-Item backend/.env.example backend/.env`)
Confirme que `backend/.gitignore` já ignora `.env` (scaffold Nest ignora). Se não, adicione `.env`.

- [ ] **Step 4: Commit** (peça permissão antes)

```bash
git add backend/package.json backend/package-lock.json backend/.env.example
git commit -m "chore(backend): add cassandra/auth deps and env example"
```

### Task 0.3: Config tipada de Cassandra/JWT

**Files:**
- Create: `backend/src/config/cassandra.config.ts`

- [ ] **Step 1: Criar o helper de config**

```ts
// backend/src/config/cassandra.config.ts
export interface AppConfig {
  port: number;
  cassandra: {
    contactPoints: string[];
    localDataCenter: string;
    keyspace: string;
  };
  jwt: { secret: string; expiresIn: string };
  corsOrigin: string;
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT ?? '3001', 10),
    cassandra: {
      contactPoints: (process.env.CASSANDRA_CONTACT_POINTS ?? '127.0.0.1').split(','),
      localDataCenter: process.env.CASSANDRA_LOCAL_DC ?? 'datacenter1',
      keyspace: process.env.CASSANDRA_KEYSPACE ?? 'toilet_kpi',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  };
}
```

- [ ] **Step 2: Commit** (peça permissão antes)

```bash
git add backend/src/config/cassandra.config.ts
git commit -m "feat(backend): typed app config loader"
```

---

## Fase 1 — Domínio: pontuação e patentes (TDD, sem infra)

### Task 1.1: Constantes e funções puras de pontuação

**Files:**
- Test: `backend/src/domain/scoring.spec.ts`
- Create: `backend/src/domain/scoring.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// backend/src/domain/scoring.spec.ts
import { pclDelta, applyPcl, patent, pontosEmJogo, Nivel } from './scoring';

describe('scoring', () => {
  it('dá os pontos certos ao cumprir por nível', () => {
    expect(pclDelta('leve', 'cumprida')).toBe(10);
    expect(pclDelta('medio', 'cumprida')).toBe(30);
    expect(pclDelta('insano', 'cumprida')).toBe(70);
  });

  it('penaliza ao falhar e zera ao pular', () => {
    expect(pclDelta('leve', 'falhou')).toBe(-5);
    expect(pclDelta('insano', 'falhou')).toBe(-20);
    expect(pclDelta('insano', 'pulou')).toBe(0);
  });

  it('aplica o delta com piso em zero', () => {
    expect(applyPcl(100, 30)).toBe(130);
    expect(applyPcl(10, -20)).toBe(0); // não fica negativo
  });

  it('deriva a patente a partir do total', () => {
    expect(patent(0)).toBe('Estagiário do Vaso');
    expect(patent(99)).toBe('Estagiário do Vaso');
    expect(patent(100)).toBe('Office-boy da Privada');
    expect(patent(3000)).toBe('CEO do Banheiro Sustentável');
    expect(patent(999999)).toBe('Lenda Iluminada do Papel Zero');
  });

  it('pontos em jogo é o valor de cumprir o nível', () => {
    expect(pointsInGame('medio')).toBe(30);
  });

  it('Nivel é usável como tipo', () => {
    const n: Nivel = 'leve';
    expect(n).toBe('leve');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run (de `backend/`): `npm test -- scoring`
Expected: FAIL — `Cannot find module './scoring'`.

- [ ] **Step 3: Implementar o mínimo**

```ts
// backend/src/domain/scoring.ts
export type Nivel = 'leve' | 'medio' | 'insano';
export type Resultado = 'cumprida' | 'falhou' | 'pulou';

export const PCL_POR_NIVEL: Record<Nivel, { cumprida: number; falhou: number }> = {
  leve: { cumprida: 10, falhou: -5 },
  medio: { cumprida: 30, falhou: -10 },
  insano: { cumprida: 70, falhou: -20 },
};

// Ordenado do maior limiar para o menor (find pega o primeiro que bate).
export const PATENTES: ReadonlyArray<{ min: number; nome: string }> = [
  { min: 6000, nome: 'Lenda Iluminada do Papel Zero' },
  { min: 3000, nome: 'CEO do Banheiro Sustentável' },
  { min: 1500, nome: 'Diretor de Higiene Íntima' },
  { min: 700, nome: 'Gerente de Dejetos' },
  { min: 300, nome: 'Analista de Resíduos Pleno' },
  { min: 100, nome: 'Office-boy da Privada' },
  { min: 0, nome: 'Estagiário do Vaso' },
];

export function pclDelta(nivel: Nivel, resultado: Resultado): number {
  if (resultado === 'pulou') return 0;
  return PCL_POR_NIVEL[nivel][resultado];
}

export function applyPcl(atual: number, delta: number): number {
  return Math.max(0, atual + delta);
}

export function patent(pcl: number): string {
  return PATENTES.find((p) => pcl >= p.min)!.nome;
}

export function pointsInGame(nivel: Nivel): number {
  return PCL_POR_NIVEL[nivel].cumprida;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- scoring`
Expected: PASS (6 testes).

- [ ] **Step 5: Commit** (peça permissão antes)

```bash
git add backend/src/domain/scoring.ts backend/src/domain/scoring.spec.ts
git commit -m "feat(domain): PCL scoring and patente rules with tests"
```

---

## Fase 2 — Missões (catálogo + sorteio, TDD)

### Task 2.1: Catálogo curado de missões

**Files:**
- Create: `backend/src/missions/missions.catalog.ts`

- [ ] **Step 1: Criar o catálogo**

```ts
// backend/src/missions/missions.catalog.ts
import { Nivel } from '../domain/scoring';

export interface Missao {
  id: string;
  level: Nivel;
  text: string;
}

export const MISSOES: ReadonlyArray<Missao> = [
  { id: 'leve-origami', level: 'leve', text: 'Folha única. Tipo origami. Você consegue.' },
  { id: 'leve-dobre', level: 'leve', text: 'Dobre, não amasse. Respeite o recurso.' },
  { id: 'leve-sopro', level: 'leve', text: 'Só um sopro de papel. O resto é coragem.' },
  { id: 'medio-bide', level: 'medio', text: 'Encare o bidê do destino.' },
  { id: 'medio-ducha', level: 'medio', text: 'Ducha higiênica, guerreiro. Sem medo.' },
  { id: 'medio-torneira', level: 'medio', text: 'Jato da torneira, igual nobre de 1700.' },
  { id: 'insano-rio', level: 'insano', text: 'Lave-se no rio mais próximo (ou na sua imaginação).' },
  { id: 'insano-bananeira', level: 'insano', text: 'Folha de bananeira: volte às origens.' },
  { id: 'insano-mangueira', level: 'insano', text: 'Mangueira do quintal, pela glória.' },
];
```

- [ ] **Step 2: Commit** (peça permissão antes)

```bash
git add backend/src/missions/missions.catalog.ts
git commit -m "feat(missions): curated mission catalog seed"
```

### Task 2.2: Serviço de sorteio (rng injetável p/ testar)

**Files:**
- Test: `backend/src/missions/missions.service.spec.ts`
- Create: `backend/src/missions/missions.service.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// backend/src/missions/missions.service.spec.ts
import { MissionsService } from './missions.service';
import { MISSOES } from './missions.catalog';

describe('MissionsService', () => {
  it('sorteia uma missão do catálogo', () => {
    const svc = new MissionsService();
    const m = svc.sort();
    expect(MISSOES.some((x) => x.id === m.id)).toBe(true);
  });

  it('usa o rng injetado para escolher o índice', () => {
    const svc = new MissionsService();
    const primeira = svc.sort(() => 0); // índice 0
    expect(primeira.id).toBe(MISSOES[0].id);
    const ultima = svc.sort(() => 0.999999); // último índice
    expect(ultima.id).toBe(MISSOES[MISSOES.length - 1].id);
  });

  it('encontra missão por id', () => {
    const svc = new MissionsService();
    expect(svc.byId('insano-rio')?.level).toBe('insano');
    expect(svc.byId('nao-existe')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- missions.service`
Expected: FAIL — `Cannot find module './missions.service'`.

- [ ] **Step 3: Implementar o mínimo**

```ts
// backend/src/missions/missions.service.ts
import { Injectable } from '@nestjs/common';
import { Missao, MISSOES } from './missions.catalog';

@Injectable()
export class MissionsService {
  private readonly catalogo: ReadonlyArray<Missao> = MISSOES;

  sort(rng: () => number = Math.random): Missao {
    const i = Math.floor(rng() * this.catalogo.length);
    return this.catalogo[Math.min(i, this.catalogo.length - 1)];
  }

  byId(id: string): Missao | undefined {
    return this.catalogo.find((m) => m.id === id);
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- missions.service`
Expected: PASS (3 testes).

- [ ] **Step 5: Criar o módulo**

```ts
// backend/src/missions/missions.module.ts
import { Module } from '@nestjs/common';
import { MissionsService } from './missions.service';

@Module({
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
```

- [ ] **Step 6: Commit** (peça permissão antes)

```bash
git add backend/src/missions/missions.service.ts backend/src/missions/missions.service.spec.ts backend/src/missions/missions.module.ts
git commit -m "feat(missions): random draw service with module"
```

---

## Fase 3 — Cassandra: conexão, schema e seed

### Task 3.1: CassandraService (conexão + bootstrap + seed)

**Files:**
- Create: `backend/src/cassandra/cassandra.service.ts`
- Create: `backend/src/cassandra/cassandra.module.ts`

- [ ] **Step 1: Criar o service**

```ts
// backend/src/cassandra/cassandra.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Client, types } from 'cassandra-driver';
import { loadConfig } from '../config/cassandra.config';
import { MISSOES } from '../missions/missions.catalog';

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CassandraService.name);
  private client!: Client;
  private readonly cfg = loadConfig().cassandra;

  async onModuleInit(): Promise<void> {
    // 1) Cliente temporário sem keyspace para criar o keyspace.
    const bootstrap = new Client({
      contactPoints: this.cfg.contactPoints,
      localDataCenter: this.cfg.localDataCenter,
    });
    await bootstrap.connect();
    await bootstrap.execute(
      `CREATE KEYSPACE IF NOT EXISTS ${this.cfg.keyspace} ` +
        `WITH replication = {'class':'SimpleStrategy','replication_factor':1}`,
    );
    await bootstrap.shutdown();

    // 2) Cliente principal já no keyspace.
    this.client = new Client({
      contactPoints: this.cfg.contactPoints,
      localDataCenter: this.cfg.localDataCenter,
      keyspace: this.cfg.keyspace,
    });
    await this.client.connect();
    await this.createTables();
    await this.seedMissions();
    this.logger.log('Cassandra pronto.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.shutdown();
  }

  execute(query: string, params: unknown[] = [], prepare = true) {
    return this.client.execute(query, params, { prepare });
  }

  private async createTables(): Promise<void> {
    const ddl = [
      `CREATE TABLE IF NOT EXISTS users_by_nick (
         nickname text PRIMARY KEY, password_hash text, created_at timestamp)`,
      `CREATE TABLE IF NOT EXISTS score_by_nick (
         nickname text PRIMARY KEY, pcl int)`,
      `CREATE TABLE IF NOT EXISTS cagadas_by_user (
         nickname text, cagada_id timeuuid, mission_id text, level text,
         mission_text text, status text, pcl_delta int,
         created_at timestamp, resolved_at timestamp,
         PRIMARY KEY (nickname, cagada_id))
         WITH CLUSTERING ORDER BY (cagada_id DESC)`,
      `CREATE TABLE IF NOT EXISTS missions (
         mission_id text PRIMARY KEY, level text, text text)`,
      `CREATE TABLE IF NOT EXISTS friendships_by_user (
         owner_nick text, friend_nick text, created_at timestamp,
         PRIMARY KEY (owner_nick, friend_nick))`,
    ];
    for (const stmt of ddl) await this.client.execute(stmt);
  }

  private async seedMissions(): Promise<void> {
    for (const m of MISSOES) {
      await this.client.execute(
        `INSERT INTO missions (mission_id, level, text) VALUES (?, ?, ?)`,
        [m.id, m.level, m.text],
        { prepare: true },
      );
    }
  }

  // util exposto para repos que precisam de TimeUuid
  timeuuidNow(): types.TimeUuid {
    return types.TimeUuid.now();
  }

  timeuuidFrom(id: string): types.TimeUuid {
    return types.TimeUuid.fromString(id);
  }
}
```

- [ ] **Step 2: Criar o módulo global**

```ts
// backend/src/cassandra/cassandra.module.ts
import { Global, Module } from '@nestjs/common';
import { CassandraService } from './cassandra.service';

@Global()
@Module({
  providers: [CassandraService],
  exports: [CassandraService],
})
export class CassandraModule {}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila sem erros de tipo.

- [ ] **Step 4: Commit** (peça permissão antes)

```bash
git add backend/src/cassandra/
git commit -m "feat(cassandra): connection, schema bootstrap and mission seed"
```

---

## Fase 4 — Usuários, score e autenticação

### Task 4.1: UsersRepository (users_by_nick + score_by_nick)

**Files:**
- Create: `backend/src/users/users.repository.ts`

- [ ] **Step 1: Criar o repositório**

```ts
// backend/src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { CassandraService } from '../cassandra/cassandra.service';

export interface UserRow {
  nickname: string;
  password_hash: string;
  created_at: Date;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly db: CassandraService) {}

  async insertUser(nickname: string, passwordHash: string): Promise<void> {
    await this.db.execute(
      `INSERT INTO users_by_nick (nickname, password_hash, created_at) VALUES (?, ?, ?)`,
      [nickname, passwordHash, new Date()],
    );
    await this.db.execute(`INSERT INTO score_by_nick (nickname, pcl) VALUES (?, ?)`, [nickname, 0]);
  }

  async findUser(nickname: string): Promise<UserRow | null> {
    const rs = await this.db.execute(
      `SELECT nickname, password_hash, created_at FROM users_by_nick WHERE nickname = ?`,
      [nickname],
    );
    return (rs.first() as unknown as UserRow) ?? null;
  }

  async getScore(nickname: string): Promise<number> {
    const rs = await this.db.execute(`SELECT pcl FROM score_by_nick WHERE nickname = ?`, [nickname]);
    const row = rs.first();
    return row ? Number(row['pcl']) : 0;
  }

  async setScore(nickname: string, pcl: number): Promise<void> {
    await this.db.execute(`INSERT INTO score_by_nick (nickname, pcl) VALUES (?, ?)`, [nickname, pcl]);
  }
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/src/users/users.repository.ts
git commit -m "feat(users): cassandra repository for identity and score"
```

### Task 4.2: UsersService (score + patente)

**Files:**
- Create: `backend/src/users/users.service.ts`

- [ ] **Step 1: Criar o service**

```ts
// backend/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { UsersRepository, UserRow } from './users.repository';
import { patent } from '../domain/scoring';

export interface PerfilResumo {
  nickname: string;
  pcl: number;
  patente: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  findUser(nickname: string): Promise<UserRow | null> {
    return this.repo.findUser(nickname);
  }

  createUser(nickname: string, passwordHash: string): Promise<void> {
    return this.repo.insertUser(nickname, passwordHash);
  }

  getScore(nickname: string): Promise<number> {
    return this.repo.getScore(nickname);
  }

  setScore(nickname: string, pcl: number): Promise<void> {
    return this.repo.setScore(nickname, pcl);
  }

  async perfil(nickname: string): Promise<PerfilResumo> {
    const pcl = await this.repo.getScore(nickname);
    return { nickname, pcl, patente: patent(pcl) };
  }
}
```

- [ ] **Step 2: Commit** (peça permissão antes)

```bash
git add backend/src/users/users.service.ts
git commit -m "feat(users): service exposing score and patente"
```

### Task 4.3: AuthService (TDD com mocks)

**Files:**
- Create: `backend/src/auth/dto/register.dto.ts`, `backend/src/auth/dto/login.dto.ts`
- Test: `backend/src/auth/auth.service.spec.ts`
- Create: `backend/src/auth/auth.service.ts`

- [ ] **Step 1: Criar DTOs**

```ts
// backend/src/auth/dto/register.dto.ts
import { IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,20}$/, { message: 'nickname: 3-20 letras/números/underscore' })
  nickname!: string;

  @IsString()
  @MinLength(4, { message: 'senha: mínimo 4 caracteres' })
  senha!: string;
}
```

```ts
// backend/src/auth/dto/login.dto.ts
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  nickname!: string;

  @IsString()
  senha!: string;
}
```

- [ ] **Step 2: Escrever o teste que falha**

```ts
// backend/src/auth/auth.service.spec.ts
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const jwt = { signAsync: jest.fn().mockResolvedValue('token-fake') };

  function makeUsers(overrides: Partial<Record<string, jest.Mock>> = {}) {
    return {
      findUser: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };
  }

  it('registra um novo usuário e devolve token', async () => {
    const users = makeUsers();
    const svc = new AuthService(users as any, jwt as any);
    const out = await svc.register('zeca', 'segredo');
    expect(users.createUser).toHaveBeenCalledWith('zeca', expect.any(String));
    expect(out.token).toBe('token-fake');
  });

  it('rejeita registro de nickname já existente', async () => {
    const users = makeUsers({
      findUser: jest.fn().mockResolvedValue({ nickname: 'zeca', password_hash: 'x' }),
    });
    const svc = new AuthService(users as any, jwt as any);
    await expect(svc.register('zeca', 'segredo')).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejeita login com senha errada', async () => {
    // hash de "certa" não bate com "errada"
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('certa', 10);
    const users = makeUsers({
      findUser: jest.fn().mockResolvedValue({ nickname: 'zeca', password_hash: hash }),
    });
    const svc = new AuthService(users as any, jwt as any);
    await expect(svc.login('zeca', 'errada')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('faz login com senha certa', async () => {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('certa', 10);
    const users = makeUsers({
      findUser: jest.fn().mockResolvedValue({ nickname: 'zeca', password_hash: hash }),
    });
    const svc = new AuthService(users as any, jwt as any);
    const out = await svc.login('zeca', 'certa');
    expect(out.token).toBe('token-fake');
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npm test -- auth.service`
Expected: FAIL — `Cannot find module './auth.service'`.

- [ ] **Step 4: Implementar o service**

```ts
// backend/src/auth/auth.service.ts
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(nickname: string, senha: string): Promise<{ token: string; nickname: string }> {
    const existing = await this.users.findUser(nickname);
    if (existing) throw new ConflictException('Esse trono já tem dono. Escolha outro nickname.');
    const hash = await bcrypt.hash(senha, 10);
    await this.users.createUser(nickname, hash);
    return { token: await this.sign(nickname), nickname };
  }

  async login(nickname: string, senha: string): Promise<{ token: string; nickname: string }> {
    const user = await this.users.findUser(nickname);
    if (!user) throw new UnauthorizedException('Credenciais inválidas.');
    const ok = await bcrypt.compare(senha, user.password_hash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas.');
    return { token: await this.sign(nickname), nickname };
  }

  private sign(nickname: string): Promise<string> {
    return this.jwt.signAsync({ sub: nickname });
  }
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test -- auth.service`
Expected: PASS (4 testes).

- [ ] **Step 6: Commit** (peça permissão antes)

```bash
git add backend/src/auth/dto backend/src/auth/auth.service.ts backend/src/auth/auth.service.spec.ts
git commit -m "feat(auth): register/login service with bcrypt + jwt (tested)"
```

### Task 4.4: JwtAuthGuard

**Files:**
- Create: `backend/src/auth/jwt-auth.guard.ts`

- [ ] **Step 1: Criar o guard**

```ts
// backend/src/auth/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { user?: string }>();
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token ausente.');
    }
    const token = header.slice('Bearer '.length);
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      req.user = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido.');
    }
  }
}
```

- [ ] **Step 2: Commit** (peça permissão antes)

```bash
git add backend/src/auth/jwt-auth.guard.ts
git commit -m "feat(auth): JWT auth guard"
```

### Task 4.5: AuthController + AuthModule

**Files:**
- Create: `backend/src/auth/auth.controller.ts`, `backend/src/auth/auth.module.ts`

- [ ] **Step 1: Criar o controller**

```ts
// backend/src/auth/auth.controller.ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.nickname, dto.senha);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.nickname, dto.senha);
  }
}
```

- [ ] **Step 2: Criar o módulo**

```ts
// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { loadConfig } from '../config/cassandra.config';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: loadConfig().jwt.secret,
      signOptions: { expiresIn: loadConfig().jwt.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
```

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/src/auth/auth.controller.ts backend/src/auth/auth.module.ts
git commit -m "feat(auth): auth controller and module"
```

### Task 4.6: UsersModule + UsersController (GET /me)

**Files:**
- Create: `backend/src/users/users.controller.ts`, `backend/src/users/users.module.ts`
- (depende de Task 5.1 CagadasRepository para o histórico — ver nota)

> **Nota de ordem:** `GET /me` retorna `historicoRecente`, que vem do `CagadasRepository` (Fase 5). Crie o `UsersModule`/controller agora **sem** o histórico (retornando `[]`), e complete o histórico no Step de integração da Task 5.4. Isso mantém as tasks pequenas e o build verde.

- [ ] **Step 1: Criar o controller (sem histórico ainda)**

```ts
// backend/src/users/users.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async me(@Req() req: Request & { user: string }) {
    const perfil = await this.users.perfil(req.user);
    return { ...perfil, historicoRecente: [] as unknown[] };
  }
}
```

- [ ] **Step 2: Criar o módulo**

```ts
// backend/src/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
```

> **Nota sobre dependência circular:** `UsersModule` importa `AuthModule` (para o `JwtAuthGuard` no controller) e `AuthModule` importa `UsersModule` (para o `UsersService`). Use `forwardRef` nos **dois** lados. Ajuste `AuthModule` para `imports: [forwardRef(() => UsersModule), JwtModule.register(...)]`.

- [ ] **Step 3: Aplicar o `forwardRef` no AuthModule**

Modify `backend/src/auth/auth.module.ts`: troque `UsersModule,` por `forwardRef(() => UsersModule),` e importe `forwardRef` de `@nestjs/common`.

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: compila sem erro de dependência circular.

- [ ] **Step 5: Commit** (peça permissão antes)

```bash
git add backend/src/users/users.controller.ts backend/src/users/users.module.ts backend/src/auth/auth.module.ts
git commit -m "feat(users): GET /me endpoint and module"
```

---

## Fase 5 — Cagadas (registrar + resolver)

### Task 5.1: CagadasRepository

**Files:**
- Create: `backend/src/cagadas/cagadas.repository.ts`

- [ ] **Step 1: Criar o repositório**

```ts
// backend/src/cagadas/cagadas.repository.ts
import { Injectable } from '@nestjs/common';
import { CassandraService } from '../cassandra/cassandra.service';
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

@Injectable()
export class CagadasRepository {
  constructor(private readonly db: CassandraService) {}

  async insertPending(nickname: string, missao: Missao): Promise<string> {
    const id = this.db.timeuuidNow();
    await this.db.execute(
      `INSERT INTO cagadas_by_user
         (nickname, cagada_id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at)
       VALUES (?, ?, ?, ?, ?, 'pendente', 0, ?, null)`,
      [nickname, id, missao.id, missao.level, missao.text, new Date()],
    );
    return id.toString();
  }

  async findById(nickname: string, cagadaId: string): Promise<CagadaRow | null> {
    const rs = await this.db.execute(
      `SELECT cagada_id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at
         FROM cagadas_by_user WHERE nickname = ? AND cagada_id = ?`,
      [nickname, this.db.timeuuidFrom(cagadaId)],
    );
    const row = rs.first();
    if (!row) return null;
    return {
      cagada_id: row['cagada_id'].toString(),
      mission_id: row['mission_id'],
      level: row['level'],
      mission_text: row['mission_text'],
      status: row['status'],
      pcl_delta: Number(row['pcl_delta']),
      created_at: row['created_at'],
      resolved_at: row['resolved_at'] ?? null,
    };
  }

  async resolve(nickname: string, cagadaId: string, status: string, pclDelta: number): Promise<void> {
    await this.db.execute(
      `UPDATE cagadas_by_user SET status = ?, pcl_delta = ?, resolved_at = ?
         WHERE nickname = ? AND cagada_id = ?`,
      [status, pclDelta, new Date(), nickname, this.db.timeuuidFrom(cagadaId)],
    );
  }

  async recent(nickname: string, limit = 10): Promise<CagadaRow[]> {
    const rs = await this.db.execute(
      `SELECT cagada_id, mission_id, level, mission_text, status, pcl_delta, created_at, resolved_at
         FROM cagadas_by_user WHERE nickname = ? LIMIT ?`,
      [nickname, limit],
    );
    return rs.rows.map((row) => ({
      cagada_id: row['cagada_id'].toString(),
      mission_id: row['mission_id'],
      level: row['level'],
      mission_text: row['mission_text'],
      status: row['status'],
      pcl_delta: Number(row['pcl_delta']),
      created_at: row['created_at'],
      resolved_at: row['resolved_at'] ?? null,
    }));
  }
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/src/cagadas/cagadas.repository.ts
git commit -m "feat(cagadas): cassandra repository"
```

### Task 5.2: CagadasService (TDD com mocks)

**Files:**
- Test: `backend/src/cagadas/cagadas.service.spec.ts`
- Create: `backend/src/cagadas/cagadas.service.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// backend/src/cagadas/cagadas.service.spec.ts
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CagadasService } from './cagadas.service';

const missao = { id: 'insano-rio', level: 'insano' as const, text: 'Lave-se no rio.' };

function deps(over: any = {}) {
  return {
    missions: { sort: jest.fn().mockReturnValue(missao), byId: jest.fn() },
    repo: {
      insertPending: jest.fn().mockResolvedValue('uuid-1'),
      findById: jest.fn(),
      resolve: jest.fn().mockResolvedValue(undefined),
      recent: jest.fn().mockResolvedValue([]),
    },
    users: {
      getScore: jest.fn().mockResolvedValue(100),
      setScore: jest.fn().mockResolvedValue(undefined),
    },
    ...over,
  };
}

describe('CagadasService', () => {
  it('registra cagada sorteando missão e devolve pontos em jogo', async () => {
    const d = deps();
    const svc = new CagadasService(d.missions as any, d.repo as any, d.users as any);
    const out = await svc.registrar('zeca');
    expect(d.repo.insertPending).toHaveBeenCalledWith('zeca', missao);
    expect(out).toEqual({
      cagadaId: 'uuid-1',
      mission: { id: 'insano-rio', level: 'insano', text: 'Lave-se no rio.' },
      pontosEmJogo: 70,
    });
  });

  it('resolve com cumprida somando pontos', async () => {
    const d = deps({
      repo: {
        findById: jest.fn().mockResolvedValue({ status: 'pendente', level: 'insano' }),
        resolve: jest.fn().mockResolvedValue(undefined),
        insertPending: jest.fn(),
        recent: jest.fn(),
      },
    });
    const svc = new CagadasService(d.missions as any, d.repo as any, d.users as any);
    const out = await svc.resolver('zeca', 'uuid-1', 'cumprida');
    expect(out.pclDelta).toBe(70);
    expect(out.totalPcl).toBe(170);
    expect(out.patente).toBe('Office-boy da Privada');
    expect(d.users.setScore).toHaveBeenCalledWith('zeca', 170);
  });

  it('aplica piso em zero ao falhar', async () => {
    const d = deps({
      users: { getScore: jest.fn().mockResolvedValue(10), setScore: jest.fn() },
      repo: {
        findById: jest.fn().mockResolvedValue({ status: 'pendente', level: 'insano' }),
        resolve: jest.fn(),
        insertPending: jest.fn(),
        recent: jest.fn(),
      },
    });
    const svc = new CagadasService(d.missions as any, d.repo as any, d.users as any);
    const out = await svc.resolver('zeca', 'uuid-1', 'falhou');
    expect(out.totalPcl).toBe(0); // 10 - 20 -> piso 0
    expect(out.pclDelta).toBe(-10); // delta aplicado real (0 - 10)
  });

  it('404 quando a cagada não existe', async () => {
    const d = deps({ repo: { findById: jest.fn().mockResolvedValue(null), insertPending: jest.fn(), resolve: jest.fn(), recent: jest.fn() } });
    const svc = new CagadasService(d.missions as any, d.repo as any, d.users as any);
    await expect(svc.resolver('zeca', 'x', 'cumprida')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('409 quando já resolvida', async () => {
    const d = deps({ repo: { findById: jest.fn().mockResolvedValue({ status: 'cumprida', level: 'leve' }), insertPending: jest.fn(), resolve: jest.fn(), recent: jest.fn() } });
    const svc = new CagadasService(d.missions as any, d.repo as any, d.users as any);
    await expect(svc.resolver('zeca', 'x', 'cumprida')).rejects.toBeInstanceOf(ConflictException);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- cagadas.service`
Expected: FAIL — `Cannot find module './cagadas.service'`.

- [ ] **Step 3: Implementar o service**

```ts
// backend/src/cagadas/cagadas.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MissionsService } from '../missions/missions.service';
import { CagadasRepository } from './cagadas.repository';
import { UsersService } from '../users/users.service';
import { applyPcl, patent, pclDelta, pontosEmJogo, Nivel, Resultado } from '../domain/scoring';

const MENSAGENS: Record<Resultado, string> = {
  cumprida: 'Respeito. Sua patente agradece e o planeta te deve uma.',
  falhou: 'O papel venceu hoje. Luto na celulose. (na verdade, festa pra ela)',
  pulou: 'Covarde. O trono registra sua hesitação.',
};

@Injectable()
export class CagadasService {
  constructor(
    private readonly missions: MissionsService,
    private readonly repo: CagadasRepository,
    private readonly users: UsersService,
  ) {}

  async registrar(nickname: string) {
    const missao = this.missions.sort();
    const cagadaId = await this.repo.insertPending(nickname, missao);
    return {
      cagadaId,
      mission: { id: missao.id, level: missao.level, text: missao.text },
      pontosEmJogo: pointsInGame(missao.level),
    };
  }

  async resolver(nickname: string, cagadaId: string, resultado: Resultado) {
    const cagada = await this.repo.findById(nickname, cagadaId);
    if (!cagada) throw new NotFoundException('Essa cagada não existe (ou não é sua).');
    if (cagada.status !== 'pendente') throw new ConflictException('Essa cagada já foi resolvida.');

    const atual = await this.users.getScore(nickname);
    const novo = applyPcl(atual, pclDelta(cagada.level as Nivel, resultado));
    const deltaAplicado = novo - atual;

    await this.users.setScore(nickname, novo);
    await this.repo.resolve(nickname, cagadaId, resultado, deltaAplicado);

    return {
      pclDelta: deltaAplicado,
      totalPcl: novo,
      patente: patent(novo),
      mensagem: MENSAGENS[resultado],
    };
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- cagadas.service`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit** (peça permissão antes)

```bash
git add backend/src/cagadas/cagadas.service.ts backend/src/cagadas/cagadas.service.spec.ts
git commit -m "feat(cagadas): register/resolve service with floor-at-zero (tested)"
```

### Task 5.3: DTO + CagadasController + CagadasModule

**Files:**
- Create: `backend/src/cagadas/dto/resolver.dto.ts`, `backend/src/cagadas/cagadas.controller.ts`, `backend/src/cagadas/cagadas.module.ts`

- [ ] **Step 1: Criar o DTO**

```ts
// backend/src/cagadas/dto/resolver.dto.ts
import { IsIn } from 'class-validator';

export class ResolverDto {
  @IsIn(['cumprida', 'falhou', 'pulou'], { message: 'resultado inválido' })
  resultado!: 'cumprida' | 'falhou' | 'pulou';
}
```

- [ ] **Step 2: Criar o controller**

```ts
// backend/src/cagadas/cagadas.controller.ts
import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CagadasService } from './cagadas.service';
import { ResolverDto } from './dto/resolver.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cagadas')
@UseGuards(JwtAuthGuard)
export class CagadasController {
  constructor(private readonly cagadas: CagadasService) {}

  @Post()
  registrar(@Req() req: Request & { user: string }) {
    return this.cagadas.registrar(req.user);
  }

  @Post(':id/resolver')
  resolver(
    @Req() req: Request & { user: string },
    @Param('id') id: string,
    @Body() dto: ResolverDto,
  ) {
    return this.cagadas.resolver(req.user, id, dto.resultado);
  }
}
```

- [ ] **Step 3: Criar o módulo**

```ts
// backend/src/cagadas/cagadas.module.ts
import { Module } from '@nestjs/common';
import { CagadasService } from './cagadas.service';
import { CagadasController } from './cagadas.controller';
import { CagadasRepository } from './cagadas.repository';
import { MissionsModule } from '../missions/missions.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MissionsModule, UsersModule, AuthModule],
  controllers: [CagadasController],
  providers: [CagadasService, CagadasRepository],
  exports: [CagadasRepository],
})
export class CagadasModule {}
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 5: Commit** (peça permissão antes)

```bash
git add backend/src/cagadas/dto backend/src/cagadas/cagadas.controller.ts backend/src/cagadas/cagadas.module.ts
git commit -m "feat(cagadas): controller, DTO and module"
```

### Task 5.4: Completar o histórico em GET /me

**Files:**
- Modify: `backend/src/users/users.controller.ts`
- Modify: `backend/src/users/users.module.ts`

- [ ] **Step 1: Injetar o CagadasRepository no controller**

Substitua o conteúdo de `backend/src/users/users.controller.ts` por:

```ts
// backend/src/users/users.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CagadasRepository } from '../cagadas/cagadas.repository';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly cagadas: CagadasRepository,
  ) {}

  @Get()
  async me(@Req() req: Request & { user: string }) {
    const perfil = await this.users.perfil(req.user);
    const recentes = await this.cagadas.recent(req.user, 10);
    const historicoRecente = recentes.map((c) => ({
      cagadaId: c.cagada_id,
      level: c.level,
      missao: c.mission_text,
      status: c.status,
      pclDelta: c.pcl_delta,
      quando: c.created_at,
    }));
    return { ...perfil, historicoRecente };
  }
}
```

- [ ] **Step 2: Importar o CagadasModule no UsersModule**

Modify `backend/src/users/users.module.ts`: adicione `imports: [forwardRef(() => AuthModule), forwardRef(() => CagadasModule)]` e importe `CagadasModule`. Em `cagadas.module.ts`, troque o import de `UsersModule` por `forwardRef(() => UsersModule)` para quebrar o ciclo (Users ↔ Cagadas).

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila sem erro de ciclo.

- [ ] **Step 4: Commit** (peça permissão antes)

```bash
git add backend/src/users/users.controller.ts backend/src/users/users.module.ts backend/src/cagadas/cagadas.module.ts
git commit -m "feat(users): include recent cagadas history in GET /me"
```

---

## Fase 6 — Amigos e ranking

### Task 6.1: FriendsRepository

**Files:**
- Create: `backend/src/friends/friends.repository.ts`

- [ ] **Step 1: Criar o repositório**

```ts
// backend/src/friends/friends.repository.ts
import { Injectable } from '@nestjs/common';
import { CassandraService } from '../cassandra/cassandra.service';

@Injectable()
export class FriendsRepository {
  constructor(private readonly db: CassandraService) {}

  async addMutual(a: string, b: string): Promise<void> {
    const now = new Date();
    await this.db.execute(
      `INSERT INTO friendships_by_user (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)`,
      [a, b, now],
    );
    await this.db.execute(
      `INSERT INTO friendships_by_user (owner_nick, friend_nick, created_at) VALUES (?, ?, ?)`,
      [b, a, now],
    );
  }

  async listFriends(owner: string): Promise<string[]> {
    const rs = await this.db.execute(
      `SELECT friend_nick FROM friendships_by_user WHERE owner_nick = ?`,
      [owner],
    );
    return rs.rows.map((r) => r['friend_nick'] as string);
  }
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add backend/src/friends/friends.repository.ts
git commit -m "feat(friends): cassandra repository for mutual friendships"
```

### Task 6.2: FriendsService (TDD com mocks)

**Files:**
- Test: `backend/src/friends/friends.service.spec.ts`
- Create: `backend/src/friends/friends.service.ts`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// backend/src/friends/friends.service.spec.ts
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FriendsService } from './friends.service';

function deps(over: any = {}) {
  return {
    repo: {
      addMutual: jest.fn().mockResolvedValue(undefined),
      listFriends: jest.fn().mockResolvedValue([]),
    },
    users: {
      findUser: jest.fn().mockResolvedValue({ nickname: 'amigo' }),
      getScore: jest.fn(),
    },
    ...over,
  };
}

describe('FriendsService', () => {
  it('não deixa adicionar a si mesmo', async () => {
    const d = deps();
    const svc = new FriendsService(d.repo as any, d.users as any);
    await expect(svc.add('zeca', 'zeca')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('404 quando o amigo não existe', async () => {
    const d = deps({ users: { findUser: jest.fn().mockResolvedValue(null), getScore: jest.fn() } });
    const svc = new FriendsService(d.repo as any, d.users as any);
    await expect(svc.add('zeca', 'fantasma')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('adiciona amizade mútua', async () => {
    const d = deps();
    const svc = new FriendsService(d.repo as any, d.users as any);
    await svc.add('zeca', 'amigo');
    expect(d.repo.addMutual).toHaveBeenCalledWith('zeca', 'amigo');
  });

  it('monta o ranking ordenado por PCL com títulos', async () => {
    const scores: Record<string, number> = { zeca: 50, ana: 300, bia: 0 };
    const d = deps({
      repo: { addMutual: jest.fn(), listFriends: jest.fn().mockResolvedValue(['ana', 'bia']) },
      users: {
        findUser: jest.fn(),
        getScore: jest.fn((n: string) => Promise.resolve(scores[n])),
      },
    });
    const svc = new FriendsService(d.repo as any, d.users as any);
    const ranking = await svc.ranking('zeca');
    expect(ranking.map((r) => r.nickname)).toEqual(['ana', 'zeca', 'bia']);
    expect(ranking[0].titulo).toBe('Soberano do Trono');
    expect(ranking[ranking.length - 1].titulo).toBe('Lanterna da Latrina');
    expect(ranking[1].patente).toBe('Estagiário do Vaso'); // zeca, 50 PCL
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- friends.service`
Expected: FAIL — `Cannot find module './friends.service'`.

- [ ] **Step 3: Implementar o service**

```ts
// backend/src/friends/friends.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FriendsRepository } from './friends.repository';
import { UsersService } from '../users/users.service';
import { patent } from '../domain/scoring';

export interface RankingItem {
  nickname: string;
  pcl: number;
  patente: string;
  titulo: string;
}

@Injectable()
export class FriendsService {
  constructor(
    private readonly repo: FriendsRepository,
    private readonly users: UsersService,
  ) {}

  async add(me: string, friend: string): Promise<{ ok: true }> {
    if (me === friend) {
      throw new BadRequestException('Não dá pra competir consigo mesmo, narcisista do vaso.');
    }
    const exists = await this.users.findUser(friend);
    if (!exists) throw new NotFoundException('Esse nickname não existe.');
    await this.repo.addMutual(me, friend);
    return { ok: true };
  }

  async ranking(me: string): Promise<RankingItem[]> {
    const friends = await this.repo.listFriends(me);
    const nicks = [me, ...friends];
    const itens = await Promise.all(
      nicks.map(async (nickname) => {
        const pcl = await this.users.getScore(nickname);
        return { nickname, pcl, patente: patent(pcl), titulo: patent(pcl) };
      }),
    );
    itens.sort((a, b) => b.pcl - a.pcl);
    if (itens.length > 0) {
      itens[0].titulo = 'Soberano do Trono';
      if (itens.length > 1) itens[itens.length - 1].titulo = 'Lanterna da Latrina';
    }
    return itens;
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- friends.service`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit** (peça permissão antes)

```bash
git add backend/src/friends/friends.service.ts backend/src/friends/friends.service.spec.ts
git commit -m "feat(friends): add-friend and ranking service (tested)"
```

### Task 6.3: FriendsController + FriendsModule

**Files:**
- Create: `backend/src/friends/friends.controller.ts`, `backend/src/friends/friends.module.ts`

- [ ] **Step 1: Criar o controller**

```ts
// backend/src/friends/friends.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { IsString } from 'class-validator';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class AddFriendDto {
  @IsString()
  nickname!: string;
}

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Post()
  add(@Req() req: Request & { user: string }, @Body() dto: AddFriendDto) {
    return this.friends.add(req.user, dto.nickname);
  }

  @Get('ranking')
  ranking(@Req() req: Request & { user: string }) {
    return this.friends.ranking(req.user);
  }
}
```

- [ ] **Step 2: Criar o módulo**

```ts
// backend/src/friends/friends.module.ts
import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendsRepository } from './friends.repository';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [FriendsController],
  providers: [FriendsService, FriendsRepository],
})
export class FriendsModule {}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 4: Commit** (peça permissão antes)

```bash
git add backend/src/friends/friends.controller.ts backend/src/friends/friends.module.ts
git commit -m "feat(friends): controller and module"
```

---

## Fase 7 — Bootstrap da aplicação backend

### Task 7.1: Montar AppModule e main.ts

**Files:**
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/main.ts`
- (opcional) remover `backend/src/app.controller.ts`, `app.service.ts`, `app.controller.spec.ts` do scaffold se não usados.

- [ ] **Step 1: Reescrever o AppModule**

```ts
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CassandraModule } from './cassandra/cassandra.module';
import { MissionsModule } from './missions/missions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CagadasModule } from './cagadas/cagadas.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CassandraModule,
    MissionsModule,
    UsersModule,
    AuthModule,
    CagadasModule,
    FriendsModule,
  ],
})
export class AppModule {}
```

> Se você removeu `app.controller.ts`/`app.service.ts`, garanta que não estão mais referenciados. Delete também `app.controller.spec.ts` para não quebrar o `npm test`.

- [ ] **Step 2: Reescrever o main.ts**

```ts
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { loadConfig } from './config/cassandra.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = loadConfig();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: cfg.corsOrigin });
  await app.listen(cfg.port);
}
bootstrap();
```

- [ ] **Step 3: Rodar toda a suíte de testes unitários**

Run: `npm test`
Expected: PASS em scoring, missions.service, auth.service, cagadas.service, friends.service. (Sem necessidade de Cassandra — todos usam mocks/funções puras.)

- [ ] **Step 4: Subir o backend de ponta a ponta (precisa do Cassandra)**

Run (com `docker compose up -d` saudável): `npm run start:dev`
Expected: log "Cassandra pronto." e "Nest application successfully started" na porta 3001.

- [ ] **Step 5: Smoke manual da API** (em outro terminal)

```bash
# registrar
curl -s -X POST http://localhost:3001/auth/register -H "Content-Type: application/json" -d "{\"nickname\":\"zeca\",\"senha\":\"segredo\"}"
# guarde o token; registrar cagada
curl -s -X POST http://localhost:3001/cagadas -H "Authorization: Bearer <TOKEN>"
# resolver (use o cagadaId retornado)
curl -s -X POST http://localhost:3001/cagadas/<ID>/resolver -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"resultado\":\"cumprida\"}"
# perfil
curl -s http://localhost:3001/me -H "Authorization: Bearer <TOKEN>"
```
Expected: register devolve `{token,nickname}`; cagada devolve `{cagadaId,mission,pontosEmJogo}`; resolver devolve `{pclDelta,totalPcl,patente,mensagem}`; `/me` mostra pcl/patente e histórico.

- [ ] **Step 6: Commit** (peça permissão antes)

```bash
git add backend/src/app.module.ts backend/src/main.ts
git rm --cached backend/src/app.controller.ts backend/src/app.service.ts backend/src/app.controller.spec.ts 2>/dev/null || true
git commit -m "feat(backend): wire modules, validation, CORS and bootstrap"
```

---

## Fase 8 — Frontend (Next.js 16, Pages Router, JS)

> **Antes de começar:** leia `frontend/node_modules/next/dist/docs/` (Pages Router e variáveis de ambiente). Confirme que `pages/`, `useState`, `useEffect` e `fetch` funcionam como abaixo na versão instalada. O código abaixo é client-rendered de propósito (sem `getServerSideProps`), o que minimiza exposição a breaking changes de data fetching.

### Task 8.1: Variáveis de ambiente e cliente de API

**Files:**
- Create: `frontend/.env.local.example`
- Create: `frontend/lib/api.js`

- [ ] **Step 1: Criar `.env.local.example` e o `.env.local` real**

```bash
# frontend/.env.local.example
NEXT_PUBLIC_API_URL=http://localhost:3001
```
Run: `Copy-Item frontend/.env.local.example frontend/.env.local`

- [ ] **Step 2: Criar o cliente de API**

```js
// frontend/lib/api.js
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const TOKEN_KEY = "toilet_kpi_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Deu ruim no trono.");
  }
  return data;
}

export const api = {
  register: (nickname, senha) => request("/auth/register", { method: "POST", body: { nickname, senha }, auth: false }),
  login: (nickname, senha) => request("/auth/login", { method: "POST", body: { nickname, senha }, auth: false }),
  me: () => request("/me"),
  registrarCagada: () => request("/cagadas", { method: "POST" }),
  resolver: (id, resultado) => request(`/cagadas/${id}/resolver`, { method: "POST", body: { resultado } }),
  addFriend: (nickname) => request("/friends", { method: "POST", body: { nickname } }),
  ranking: () => request("/friends/ranking"),
};
```

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add frontend/.env.local.example frontend/lib/api.js
git commit -m "feat(frontend): API client and env example"
```

### Task 8.2: Tela de login/cadastro

**Files:**
- Create: `frontend/pages/login.js`

- [ ] **Step 1: Criar a página**

```jsx
// frontend/pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { api, setToken } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState("login"); // "login" | "register"
  const [nickname, setNickname] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErro("");
    try {
      const out = modo === "login" ? await api.login(nickname, senha) : await api.register(nickname, senha);
      setToken(out.token);
      router.push("/");
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1>Toilet KPI 🧻</h1>
      <p>{modo === "login" ? "Entre e prove seu valor no trono." : "Crie sua conta de guerreiro do bidê."}</p>
      <form onSubmit={submit}>
        <input placeholder="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 8 }} />
        <input placeholder="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} style={{ display: "block", width: "100%", marginBottom: 8 }} />
        <button type="submit" style={{ width: "100%" }}>{modo === "login" ? "Entrar" : "Cadastrar"}</button>
      </form>
      {erro && <p style={{ color: "crimson" }}>{erro}</p>}
      <button onClick={() => setModo(modo === "login" ? "register" : "login")} style={{ marginTop: 12, background: "none", border: "none", color: "blue", cursor: "pointer" }}>
        {modo === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
      </button>
    </main>
  );
}
```

- [ ] **Step 2: Verificar manualmente**

Run (de `frontend/`): `npm run dev`
Abra `http://localhost:3000/login`. Cadastre um usuário (com o backend rodando) e confirme o redirect para `/`.
Expected: redireciona sem erro; token salvo no localStorage.

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add frontend/pages/login.js
git commit -m "feat(frontend): login/register page"
```

### Task 8.3: Home — registrar cagada e resolver missão

**Files:**
- Modify (substituir): `frontend/pages/index.js`

- [ ] **Step 1: Substituir o boilerplate pela home**

```jsx
// frontend/pages/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, getToken, clearToken } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [perfil, setPerfil] = useState(null);
  const [cagada, setCagada] = useState(null); // {cagadaId, mission, pontosEmJogo}
  const [resultado, setResultado] = useState(null); // {pclDelta,totalPcl,patente,mensagem}
  const [erro, setErro] = useState("");

  async function carregarPerfil() {
    try {
      setPerfil(await api.me());
    } catch (err) {
      setErro(err.message);
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    carregarPerfil();
  }, []);

  async function registrar() {
    setErro("");
    setResultado(null);
    try {
      setCagada(await api.registrarCagada());
    } catch (err) {
      setErro(err.message);
    }
  }

  async function resolver(r) {
    try {
      const out = await api.resolver(cagada.cagadaId, r);
      setResultado(out);
      setCagada(null);
      await carregarPerfil();
    } catch (err) {
      setErro(err.message);
    }
  }

  if (!perfil) return <main style={{ fontFamily: "sans-serif", margin: 40 }}>Carregando o trono…</main>;

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong>{perfil.nickname}</strong>
          <div>Patente: {perfil.patente} · {perfil.pcl} PCL</div>
        </div>
        <nav>
          <Link href="/amigos">Amigos</Link>{" · "}
          <button onClick={() => { clearToken(); router.push("/login"); }} style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}>sair</button>
        </nav>
      </header>

      <section style={{ textAlign: "center", margin: "32px 0" }}>
        {!cagada && (
          <button onClick={registrar} style={{ fontSize: 22, padding: "16px 24px" }}>
            💩 Registrar cagada
          </button>
        )}

        {cagada && (
          <div style={{ border: "2px dashed #888", borderRadius: 12, padding: 20 }}>
            <small>Missão nível {cagada.mission.level} · vale {cagada.pontosEmJogo} PCL</small>
            <h2>{cagada.mission.text}</h2>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => resolver("cumprida")}>✅ Cumpri</button>
              <button onClick={() => resolver("pulou")}>🐔 Pulei</button>
              <button onClick={() => resolver("falhou")}>🧻 Falhei</button>
            </div>
          </div>
        )}

        {resultado && (
          <div style={{ marginTop: 16 }}>
            <p>{resultado.mensagem}</p>
            <p>{resultado.pclDelta >= 0 ? "+" : ""}{resultado.pclDelta} PCL · total {resultado.totalPcl} · {resultado.patente}</p>
          </div>
        )}
      </section>

      <section>
        <h3>Histórico recente</h3>
        <ul>
          {perfil.historicoRecente.map((h) => (
            <li key={h.cagadaId}>
              [{h.status}] {h.missao} ({h.pclDelta >= 0 ? "+" : ""}{h.pclDelta} PCL)
            </li>
          ))}
        </ul>
      </section>

      {erro && <p style={{ color: "crimson" }}>{erro}</p>}
    </main>
  );
}
```

- [ ] **Step 2: Verificar manualmente**

Com backend + `npm run dev` rodando, abra `http://localhost:3000`. Registre uma cagada, resolva como "Cumpri" e confirme: a missão some, aparece a mensagem + novo total/patente, e o histórico atualiza.
Expected: fluxo completo funciona; PCL sobe ao cumprir, cai (com piso 0) ao falhar.

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add frontend/pages/index.js
git commit -m "feat(frontend): home with register-cagada and resolve-mission flow"
```

### Task 8.4: Tela de amigos e ranking

**Files:**
- Create: `frontend/pages/amigos.js`

- [ ] **Step 1: Criar a página**

```jsx
// frontend/pages/amigos.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, getToken } from "@/lib/api";

export default function Amigos() {
  const router = useRouter();
  const [ranking, setRanking] = useState([]);
  const [nick, setNick] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    try {
      setRanking(await api.ranking());
    } catch (err) {
      setErro(err.message);
    }
  }

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    carregar();
  }, []);

  async function adicionar(e) {
    e.preventDefault();
    setErro("");
    try {
      await api.addFriend(nick);
      setNick("");
      await carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <p><Link href="/">← voltar ao trono</Link></p>
      <h1>Ranking de amigos</h1>
      <form onSubmit={adicionar} style={{ marginBottom: 16 }}>
        <input placeholder="nickname do amigo" value={nick} onChange={(e) => setNick(e.target.value)} />
        <button type="submit">Adicionar</button>
      </form>
      {erro && <p style={{ color: "crimson" }}>{erro}</p>}
      <ol>
        {ranking.map((r) => (
          <li key={r.nickname}>
            <strong>{r.nickname}</strong> — {r.pcl} PCL — <em>{r.titulo}</em>
          </li>
        ))}
      </ol>
    </main>
  );
}
```

- [ ] **Step 2: Verificar manualmente**

Crie um segundo usuário (em aba anônima ou via curl), adicione-o como amigo e confirme que ele aparece no ranking, ordenado por PCL, com os títulos "Soberano do Trono" / "Lanterna da Latrina" nos extremos.
Expected: amizade mútua funciona; ranking ordenado correto.

- [ ] **Step 3: Commit** (peça permissão antes)

```bash
git add frontend/pages/amigos.js
git commit -m "feat(frontend): friends page with add and ranking"
```

---

## Fase 9 — Verificação final

### Task 9.1: Suíte completa e checagem de aceitação

- [ ] **Step 1: Lint + testes do backend**

Run (de `backend/`): `npm run lint && npm test`
Expected: lint sem erros; todos os testes unitários passam.

- [ ] **Step 2: Build do frontend**

Run (de `frontend/`): `npm run build`
Expected: build conclui sem erros (consulte os docs locais se algum import/feature divergir do Next 16).

- [ ] **Step 3: Checklist de aceitação manual** (backend + frontend rodando)

- [ ] Cadastro e login funcionam; nickname duplicado dá erro amigável.
- [ ] Registrar cagada sorteia missão com nível e pontos em jogo.
- [ ] Cumprir soma PCL; pular não muda; falhar reduz com piso em 0.
- [ ] Patente muda ao cruzar limiares.
- [ ] Adicionar amigo por nick funciona (mútuo); self/inexistente dão erro.
- [ ] Ranking ordena por PCL com títulos nos extremos.
- [ ] Token ausente/inválido bloqueia rotas protegidas (401).

- [ ] **Step 4: Commit final** (peça permissão antes)

```bash
git add -A
git commit -m "chore: finalize Toilet KPI missions MVP"
```

---

## Notas finais

- **Testes de integração com Cassandra real:** o spec previu e2e via container Docker. Este plano cobre o domínio com testes unitários (rápidos, sem infra) e valida a camada Cassandra via smoke manual (Task 7.5 / 9.1). Se quiser e2e automatizado, adicione um `test/*.e2e-spec.ts` (Supertest) que sobe o app com `docker compose up` no CI — fica como evolução fora do MVP.
- **503 quando o Cassandra cai (spec §13):** não implementado neste plano. Sem um `ExceptionFilter` dedicado, uma falha de conexão do `cassandra-driver` vira **500** genérico (o backend nem sobe se o Cassandra estiver fora, por causa do bootstrap no `onModuleInit`). Para entregar o 503 com mensagem de zoeira "O trono está fora do ar 🚽", adicione depois um filtro global que mapeia `NoHostAvailableError`/erros do driver para `ServiceUnavailableException`. Deixado de fora do MVP de propósito (polimento), mas registrado aqui para não ser uma lacuna silenciosa.
- **Itens deferidos (do spec §16):** pool completo de missões, distribuição de sorteio por nível, persistência do token (hoje localStorage), e2e com Cassandra. Nenhum bloqueia o MVP.
