# Toilet KPI — Missões por Cagada (Design / Spec do MVP)

> Transformando papel higiênico em vexame público. 🧻

**Status:** Aprovado para planejamento. Este documento é o **"o quê" e o "porquê"**; o "como" detalhado (passo a passo) virá no plano de implementação. Nenhum código foi escrito ainda.

**Data:** 2026-05-30

---

## 1. Visão e tom

O Toilet KPI é um **produto-piada**, deliberadamente pouco útil. O objetivo declarado é te incentivar a **não usar papel higiênico** através de **missões absurdas** de "economia" (lavar-se no rio, folha de bananeira, mangueira do quintal), embaladas num **tom corporativo pomposo e fingidamente sério**. A graça é levar algo idiota a sério demais — e competir com os amigos pra ver quem é o mais corajoso (ou o mais covarde) do trono.

O humor **é o produto**, não um enfeite. Utilidade real é, no máximo, um efeito colateral acidental.

---

## 2. Escopo do MVP

### Dentro deste spec
- Autenticação simples (nickname + senha).
- Registro de "cagada" (evento recorrente, precisa ser rápido).
- Sorteio de **missão absurda** por cagada, a partir de um **pool curado com níveis** (leve / médio / insano).
- Resolução da missão na honra (cumpri / pulei / falhei) com efeito em pontos.
- **Pontos de Cu Limpo (PCL)** e **escada de patentes** derivada do total.
- **Amigos** (adicionar por nickname, amizade mútua instantânea) e **ranking de amigos** (competição amigável).

### Fora deste spec (fases futuras)
- Motor de **métricas reais** (folhas → rolos → custo R$ → água → CO₂) do README §4.
- Dashboard satírico de KPIs.
- **Badges** colecionáveis, **streaks**, **metas semanais**.
- Compartilhamento social externo (fora o ranking de amigos).
- Perfis de consumo e telas de comparação/benchmark.

> Estas exclusões são intencionais: mantêm o MVP enxuto e engraçado. As estruturas de dados são pensadas para não impedir esses acréscimos depois.

---

## 3. Loop principal

1. **Login** com `nickname` + senha.
2. **Tela inicial:** patente atual no topo + botão gigante **"Registrar cagada"** 💩.
3. Ao registrar, o app **sorteia uma missão** do pool curado, com um nível (**leve / médio / insano**), exibida num card com a frase engraçada e os **PCL em jogo**.
4. O usuário marca o **resultado** (na honra — não há auditoria):
   - **Cumpri** ✅ → ganha os PCL do nível.
   - **Pulei** 🐔 → 0 PCL, sem penalidade; o app o chama de covarde (progresso travado).
   - **Falhei (usei papel)** 🧻 → **multa** de PCL e luto dramático do app (pode rebaixar a patente).
5. O total de PCL define a **patente**. O usuário sobe (ou cai) na escada.
6. A cagada e seu resultado entram no **histórico** do usuário.

> **Cagadas pendentes:** registrar uma nova cagada é sempre permitido, mesmo com uma anterior ainda sem resultado. Cagadas não resolvidas permanecem com `status = pendente` no histórico e não rendem nem descontam PCL; elas não bloqueiam o registro de novas. (Sem limpeza automática no MVP.)

---

## 4. Regras de pontuação (PCL)

Valores **configuráveis** (constantes nomeadas, calibráveis):

| Nível | Cumpriu | Pulei | Falhei |
| ----- | ------- | ----- | ------ |
| Leve   | +10 | 0 | −5  |
| Médio  | +30 | 0 | −10 |
| Insano | +70 | 0 | −20 |

- O total de PCL **nunca fica negativo** (piso em 0).
- "Pulei" nunca penaliza — apenas trava o progresso.
- "Falhei" penaliza e pode rebaixar a patente (regra escolhida em vez de só "travar").

---

## 5. Escada de patentes

Derivada do total de PCL (limiares **configuráveis**):

| PCL (a partir de) | Patente |
| ----------------- | ------- |
| 0     | Estagiário do Vaso |
| 100   | Office-boy da Privada |
| 300   | Analista de Resíduos Pleno |
| 700   | Gerente de Dejetos |
| 1500  | Diretor de Higiene Íntima |
| 3000  | CEO do Banheiro Sustentável |
| 6000+ | Lenda Iluminada do Papel Zero |

A patente **não é armazenada**; é calculada no app a partir do `pcl` atual.

---

## 6. Missões (pool curado)

Lista fixa, escrita à mão, **semeada no banco** e carregada **em memória** no boot do backend (Cassandra não sorteia linha aleatória de forma eficiente). Cada missão tem um `id`, um `level` e um `text` engraçado. O sorteio é aleatório (distribuição entre níveis é configurável).

Amostra (o pool completo é escrito durante a implementação):

- **Leve (+10):**
  - "Folha única. Tipo origami. Você consegue."
  - "Dobre, não amasse. Respeite o recurso."
- **Médio (+30):**
  - "Encare o bidê do destino."
  - "Ducha higiênica, guerreiro. Sem medo."
  - "Jato da torneira, igual nobre de 1700."
- **Insano (+70):**
  - "Lave-se no rio mais próximo (ou na sua imaginação)."
  - "Folha de bananeira: volte às origens."
  - "Mangueira do quintal, pela glória."

---

## 7. Amigos e competição

- **Adicionar amigo** por `nickname` → amizade **mútua instantânea** (sem pedido/aceite). Grava duas linhas (a→b e b→a).
- **Ranking de amigos:** o usuário + seus amigos, ordenados por **PCL desc**, mostrando a patente de cada um. Leitura faz *point reads* do PCL de cada amigo (lista pequena) e ordena no app.
- **Zoeira da competição:** o 1º lugar recebe o título **"Soberano do Trono"**; o último, **"Lanterna da Latrina"**.

---

## 8. Arquitetura (NestJS — slice vertical, módulos leves)

- **AuthModule** — register/login, hash de senha (bcrypt), emissão/validação de JWT, guard de autenticação.
- **UsersModule** — identidade do usuário + placar de PCL; deriva a patente a partir do total.
- **MissionsModule** — catálogo curado carregado em memória no boot; sorteio aleatório por nível; regras de pontuação como **constantes nomeadas**.
- **CagadasModule** — registra a cagada (atribui a missão sorteada) e resolve a cagada (aplica o delta de PCL, atualiza o contador, grava no histórico).
- **FriendsModule** — adicionar amigo (escrita mútua) e ranking.
- **CassandraModule** — provider da conexão (`cassandra-driver`), bootstrap do keyspace/tabelas e seed das missões.

As regras de pontuação e os limiares de patente vivem em **configuração desacoplada** (constantes nomeadas), no espírito do README §4: nada de número solto no código.

---

## 9. Modelo de dados Cassandra

Modelado **a partir das queries** (sem JOIN, sem filtro arbitrário; desnormalização onde necessário).

| Tabela | Partition key | Clustering | Colunas | Serve a |
| ------ | ------------- | ---------- | ------- | ------- |
| `users_by_nick` | `nickname` | — | `password_hash`, `created_at` | login, identidade |
| `score_by_nick` | `nickname` | — | `pcl` (counter) | total de pontos (patente derivada no app) |
| `cagadas_by_user` | `nickname` | `cagada_id` (timeuuid) DESC | `mission_id`, `level`, `mission_text`, `status`, `pcl_delta`, `created_at`, `resolved_at` | histórico + atividade recente |
| `missions` | `mission_id` | — | `level`, `text` | seed; carregado em memória pro sorteio |
| `friendships_by_user` | `owner_nick` | `friend_nick` | `created_at` | lista de amigos (2 escritas por amizade) |

**Notas de Cassandra:**
- Tabela counter (`score_by_nick`) só aceita PK + colunas counter → a **patente é calculada no app**.
- O sorteio de missão é feito **em memória** (catálogo pequeno e estático).
- O ranking faz *point reads* do `pcl` de cada amigo e ordena no app — adequado para listas pequenas de amigos.
- `cagadas_by_user` guarda o texto da missão junto (`mission_text`) para o histórico ser autocontido, mesmo que o catálogo mude depois.

---

## 10. API REST

| Método & rota | Auth | Corpo / Retorno |
| ------------- | ---- | --------------- |
| `POST /auth/register` | — | `{nickname, senha}` |
| `POST /auth/login` | — | `{nickname, senha}` → `{ token }` |
| `GET /me` | ✅ | → `{ nickname, pcl, patente, historicoRecente }` |
| `POST /cagadas` | ✅ | → `{ cagadaId, mission:{id,level,text}, pontosEmJogo }` |
| `POST /cagadas/:id/resolver` | ✅ | `{ resultado: cumprida\|falhou\|pulou }` → `{ pclDelta, totalPcl, patente, mensagem }` |
| `POST /friends` | ✅ | `{ nickname }` → adiciona (mútuo) |
| `GET /friends/ranking` | ✅ | → `[{ nickname, pcl, patente, titulo }]` ordenado |

`POST /cagadas` cria o registro **pendente** e atribui a missão sorteada; `POST /cagadas/:id/resolver` aplica o resultado.

---

## 11. Frontend (Next.js 16, Pages Router, JavaScript)

- `/login` — login + cadastro (toggle).
- `/` (home) — patente atual no topo; botão **"Registrar cagada"** → card da missão com **Cumpri / Pulei / Falhei** → resultado com zoeira + novo total/patente; histórico recente embaixo.
- `/amigos` — adicionar por nick + ranking de amigos.
- Cliente de API simples (`fetch`) com o token JWT.

> ⚠️ **Restrição:** o `frontend/AGENTS.md` avisa que esta versão do Next.js (16) tem breaking changes em relação a versões anteriores. O plano de implementação deve incluir, como passo obrigatório, **ler os docs locais** em `node_modules/next/dist/docs/` antes de escrever qualquer código de frontend.

---

## 12. Autenticação

- `nickname` + senha. Senha com **hash bcrypt** (nunca em texto puro).
- **JWT stateless** emitido no login; o frontend o guarda e o envia nas rotas autenticadas.
- Guard de autenticação no NestJS valida o token nas rotas protegidas.

---

## 13. Tratamento de erros

| Situação | Resposta |
| -------- | -------- |
| Register com nick já existente | **409** |
| Login com credenciais inválidas | **401** |
| Token ausente/inválido | **401** |
| Adicionar amigo inexistente | **404** |
| Adicionar a si mesmo | **400** ("não dá pra competir consigo mesmo, narcisista do vaso") |
| Adicionar amigo já existente | idempotente (sucesso) |
| Resolver cagada inexistente / de outro usuário | **404** |
| Resolver cagada já resolvida | **409** |
| Cassandra indisponível | **503** ("O trono está fora do ar 🚽") |
| Input inválido (formato do nick, senha mínima) | **400** |

---

## 14. Estratégia de testes

(Descrita aqui; **construída apenas na fase de implementação**.)

- **Unit (backend):** regras de pontuação e derivação de patente (funções puras), sorteio por nível, piso de PCL em 0, escrita mútua de amizade.
- **Integração / e2e (backend):** endpoints contra Cassandra real via container Docker **ou** camada de repositório mockada.
- **Frontend:** leve — fluxo do card de missão; o restante validado manualmente no MVP.

---

## 15. Constantes configuráveis (núcleo)

No espírito do README §4 — tudo nomeado, nada solto:

- PCL por nível e por resultado (tabela da §4).
- Limiares e nomes das patentes (tabela da §5).
- Pool de missões (texto + nível) — semente.
- Distribuição de probabilidade do sorteio entre níveis.
- Títulos de ranking ("Soberano do Trono", "Lanterna da Latrina").

---

## 16. Decisões deferidas / pontos em aberto

1. **Pool completo de missões** — só uma amostra está definida; o resto é escrito na implementação (mantendo o tom).
2. **Distribuição do sorteio** — proporção leve/médio/insano a calibrar (padrão sugerido: mais leves, menos insanas).
3. **Persistência do token no frontend** — `localStorage` vs cookie httpOnly (decidir no plano).
4. **Integração Cassandra nos testes** — container Docker vs repositório mockado (decidir no plano).
5. **"Mês"/períodos** — não se aplica a este MVP (sem métricas/streaks/metas semanais ainda).
