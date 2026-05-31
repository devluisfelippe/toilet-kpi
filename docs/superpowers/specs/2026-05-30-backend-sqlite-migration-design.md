# Migração do backend de Cassandra para SQLite nativo do Node

> **Data:** 2026-05-30
> **Escopo:** `backend/` — substituição da camada de persistência. Sem mudanças de frontend.

## Objetivo

Substituir o Cassandra pelo módulo nativo `node:sqlite`, removendo a dependência
`cassandra-driver` e toda a infraestrutura de Cassandra (serviço Docker, keyspace,
tipos `timeuuid`). O backend passa a persistir em um único arquivo SQLite, criado e
versionado de schema pela própria aplicação no boot, mantendo o contrato de API e a
suíte de testes existentes intactos.

## Decisões

- **Runtime:** Docker base sobe de `node:22-slim` para `node:24-slim`. O `node:sqlite`
  exige a flag `--experimental-sqlite` no Node 22; no Node 24 funciona sem flag.
  Mantém-se `slim` (Debian, glibc) para preservar a compilação nativa do `bcrypt` —
  o `bcrypt` segue inalterado.
- **Schema:** redesenho relacional limpo. Como a troca de engine não migra dados
  existentes, as tabelas recebem nomes relacionais (`users`, `scores`, `cagadas`,
  `friendships`) e a tabela morta `missions` (semeada mas nunca lida) é descartada.
- **PK de cagada:** `crypto.randomUUID()` (string), preservando o contrato de id-string
  com o frontend e evitando enumeração de ids entre usuários.
- **Persistência:** o arquivo `.db` vive em caminho configurável (`DATABASE_FILE`) sobre
  um volume nomeado do Docker, sobrevivendo a reinícios/recriações do container.
- **Camada de acesso:** as assinaturas `async` dos repositórios são mantidas; o
  `node:sqlite` é síncrono, então o `DatabaseService` expõe helpers síncronos e os
  métodos `async` dos repositórios apenas retornam o resultado. Zero mudança em
  services, controllers e nos testes que os exercitam.

## Arquitetura

### Camada de banco (`src/database/`)

Substitui `src/cassandra/`. Espelha a forma de módulo global atual para minimizar o
blast radius de DI.

- **`DatabaseModule`** — `@Global`, provê e exporta `DatabaseService`.
- **`DatabaseService`** (`OnModuleInit`, `OnModuleDestroy`):
  - `onModuleInit`: garante a existência do diretório do arquivo, abre a conexão
    `DatabaseSync(config.database.file)`, aplica `PRAGMA journal_mode = WAL` e
    `PRAGMA foreign_keys = ON`, e cria as tabelas de forma idempotente
    (`CREATE TABLE IF NOT EXISTS`). **Não** há seed de missões.
  - `onModuleDestroy`: `this.db?.close()` — guardado, para que o teste de wiring
    (que apenas compila o grafo, sem `init()`) nunca abra um arquivo.
  - Helpers síncronos para os repositórios:
    - `run(sql, params)` → executa `prepare(sql).run(...params)`.
    - `get<T>(sql, params)` → `prepare(sql).get(...params)` (linha única ou `undefined`).
    - `all<T>(sql, params)` → `prepare(sql).all(...params)` (array).
  - Os helpers `timeuuidNow`/`timeuuidFrom` são removidos.

`node:sqlite` usa placeholders posicionais `?`, idênticos ao driver atual — as queries
mudam pouco.

### Schema SQLite

Timestamps são gravados como texto ISO-8601 (`new Date().toISOString()`) e reconvertidos
para `Date` na leitura, preservando os tipos `Date` em `CagadaRow` e o payload de `/me`.

```sql
CREATE TABLE IF NOT EXISTS users (
  nickname      TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scores (
  nickname TEXT PRIMARY KEY,
  pcl      INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (nickname) REFERENCES users(nickname)
);

CREATE TABLE IF NOT EXISTS cagadas (
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
);
CREATE INDEX IF NOT EXISTS idx_cagadas_nickname ON cagadas(nickname);

CREATE TABLE IF NOT EXISTS friendships (
  owner_nick  TEXT NOT NULL,
  friend_nick TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  PRIMARY KEY (owner_nick, friend_nick),
  FOREIGN KEY (owner_nick)  REFERENCES users(nickname),
  FOREIGN KEY (friend_nick) REFERENCES users(nickname)
);
```

### Repositórios (assinaturas inalteradas)

- **`UsersRepository`**
  - `insertUser` → insere em `users` e em `scores` (pcl 0).
  - `findUser` → `get` em `users`.
  - `getScore` → `get` em `scores` (0 se ausente).
  - `setScore` → upsert (`INSERT ... ON CONFLICT(nickname) DO UPDATE SET pcl = excluded.pcl`).
- **`CagadasRepository`**
  - `insertPending` → gera `crypto.randomUUID()` + `created_at` ISO, status `'pendente'`,
    `pcl_delta` 0, `resolved_at` NULL; retorna o id string.
  - `findById` → `get` por `id` e `nickname`.
  - `resolve` → `UPDATE` de `status`, `pcl_delta`, `resolved_at`.
  - `recent` → `SELECT ... WHERE nickname = ? ORDER BY rowid DESC LIMIT ?` (mais recentes
    primeiro, equivalente à ordem de clustering DESC do Cassandra).
  - O mapeador converte `id` → `cagada_id` e os campos de data via `new Date(...)`.
- **`FriendsRepository`**
  - `addMutual` → dois `INSERT OR IGNORE` (idempotente, como o upsert do Cassandra).
  - `listFriends` → `all` por `owner_nick`.

### Configuração

`src/config/cassandra.config.ts` é renomeado para `src/config/app.config.ts`. O
`AppConfig` perde o bloco `cassandra` e ganha `database: { file: string }`, lendo
`DATABASE_FILE` (default `./data/toilet_kpi.db`). Os dois importadores (`src/main.ts`,
`src/auth/auth.module.ts`) passam a apontar para o novo caminho.

### Wiring

- Novos `src/database/database.module.ts` e `src/database/database.service.ts`.
- Remove `src/cassandra/` e `src/config/cassandra.config.ts`.
- `app.module.ts` importa `DatabaseModule` no lugar de `CassandraModule`.

## Docker e ambiente

- **`Dockerfile`**: base → `node:24-slim`. Ferramentas de build (`python3 make g++`)
  permanecem para o `bcrypt`. `CMD` de prod inalterado (`node dist/main`).
- **`docker-compose.yml`**: remove o serviço `cassandra`, seu healthcheck, o
  `depends_on` do backend e o volume `cassandra-data`. Adiciona um volume nomeado
  `backend-data` montado em `/app/data`, com `DATABASE_FILE=/app/data/toilet_kpi.db`.
- **`.env` / `.env.example`**: `CASSANDRA_*` → `DATABASE_FILE`. `JWT_*` e `CORS_ORIGIN`
  permanecem.
- **`.gitignore` / `.dockerignore`**: ignorar `data/` e `*.db` para não versionar o
  arquivo SQLite.

## Dependências

- Remover `cassandra-driver` de `package.json`. `node:sqlite` é embutido no runtime —
  nada é adicionado.

## Testes

- `app.module.spec.ts`: ajustar o texto do comentário que cita Cassandra. O teste segue
  apenas compilando o grafo (sem `init()`), portanto nenhum arquivo de banco é aberto.
- Demais specs (`auth`, `cagadas`, `friends`) fazem mock dos repositórios/serviços e não
  são afetadas.

## Fora de escopo

- Documentos históricos de tasks em `docs/tasks/` (registros de trabalho passado).
- `bcrypt` (mantido como está).
- Qualquer alteração no frontend.

## Critérios de aceite

- [ ] `cassandra-driver` removido do `package.json`; nenhum import de `cassandra-driver`
  resta no `src/`.
- [ ] `npm run build` compila sem erros de tipo.
- [ ] `npm test` passa (suíte existente verde).
- [ ] Ao iniciar, o backend cria o arquivo SQLite e as tabelas `users`, `scores`,
  `cagadas`, `friendships` de forma idempotente (rodar duas vezes não quebra).
- [ ] Fluxos preservados: registrar/login, registrar/resolver cagada, perfil `/me` com
  histórico recente, adicionar amigo e ranking.
- [ ] `docker compose up` sobe apenas o `backend`, sem serviço de banco externo, e o
  arquivo `.db` persiste em volume nomeado.
