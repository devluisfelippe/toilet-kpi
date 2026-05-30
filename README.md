# Toilet KPI 🧻

> Transformando papel higiênico em consciência sustentável.

Documento de contexto do produto. Serve como base para planejamento técnico:
descreve o domínio, as regras de cálculo, as entidades e as funcionalidades.
Não é código — é o "o quê" e o "porquê" antes do "como".

---

## 1. Visão

Todo mundo usa papel higiênico. Quase ninguém pensa no impacto disso.

O Toilet KPI pega um hábito invisível e o transforma em três coisas mensuráveis:
**consciência ambiental**, **economia doméstica** e **gamificação divertida**.
O tom é leve e bem-humorado de propósito — humor reduz a sensação de "controle"
e aumenta o engajamento.

A proposta de fundo não é papel higiênico. É transformar microdesperdícios
invisíveis em métricas que a pessoa consegue ver e mudar.

---

## 2. Problema

O papel higiênico é um dos produtos mais consumidos dentro de casa. Pequenos
excessos diários se acumulam em:

- maior consumo de celulose;
- aumento do uso industrial de água;
- mais emissão de CO₂;
- mais embalagens descartadas;
- gasto doméstico que ninguém percebe.

A pergunta que ninguém sabe responder: _"quantas voltas eu dou na mão por mês?"_

---

## 3. A grande ideia

O usuário registra:

- quantas vezes foi ao banheiro;
- quantas "voltas na mão" deu;
- se usou água como complemento (ducha/bidê).

O app calcula e mostra:

- folhas consumidas;
- rolos utilizados;
- gasto mensal estimado (R$);
- litros de água industrial associados;
- CO₂ gerado;
- economia potencial.

Tudo com linguagem descontraída.

---

## 4. Modelo de cálculo (núcleo técnico)

Estas são as constantes e fórmulas que o motor de cálculo precisa implementar.
Devem ser **configuráveis** (constantes nomeadas, não números soltos no código),
porque são estimativas e provavelmente vão ser ajustadas/calibradas.

### Constantes base

| Constante                | Valor             | Observação                           |
| ------------------------ | ----------------- | ------------------------------------ |
| Folhas por volta na mão  | ≈ 5 folhas        | média                                |
| Folhas por rolo          | ≈ 200 folhas      |                                      |
| Água industrial por rolo | ≈ 140 litros      | custo de produção do rolo            |
| Preço do rolo            | configurável (R$) | input do usuário / padrão regional   |
| CO₂ por rolo             | a definir         | falta a constante na fonte (ver §10) |

### Fórmulas

```
folhas_por_uso       = voltas_na_mao × FOLHAS_POR_VOLTA
folhas_por_dia       = idas_por_dia × folhas_por_uso
consumo_mensal_folhas = idas_por_dia × folhas_por_uso × 30
```

Cadeia de conversão:

```
folhas → rolos → custo (R$) → impacto ambiental (água / CO₂)

rolos          = folhas / FOLHAS_POR_ROLO
custo          = rolos × PRECO_DO_ROLO
agua_litros    = rolos × AGUA_POR_ROLO
co2            = rolos × CO2_POR_ROLO
```

> Nota: a fonte usa multiplicador 30 para o mês. Avaliar usar dias reais do mês
> para o cálculo "mensal real" vs. o estimado.

### Exemplo de referência (para validar o cálculo)

Entrada: 2 idas/dia, 1 volta na mão, ~5 folhas por uso.

- ~300 folhas/mês (`2 × 5 × 30`)
- ~1,5 rolo/mês (`300 / 200`)
- economia anual significativa vs. consumo médio.

Mensagem do app no resultado:

> "Parabéns! Você salvou mais papel do que aquele amigo que parece estar
> imprimindo um TCC no banheiro."

---

## 5. Perfis de consumo (para simulação / comparação)

| Perfil       | Folhas/dia | Rolos/ano | Impacto |
| ------------ | ---------- | --------- | ------- |
| Econômico    | 5          | ~9        | Baixo   |
| Moderado     | 15         | ~27       | Médio   |
| Alto consumo | 30         | ~54       | Elevado |

Útil para: tela de comparação, definição de meta inicial e benchmark do usuário.

---

## 6. Jornada do usuário

1. Cadastro simples.
2. Definição do perfil de consumo.
3. Registro rápido diário (precisa ser **muito** rápido — é o uso recorrente).
4. Dashboard sustentável.
5. Metas e desafios semanais.
6. Compartilhamento de resultados.

---

## 7. Gamificação

Badges (humor é parte do produto, não enfeite):

- Mestre da Folha Única
- Ninja da Ducha
- Guardião da Celulose
- CEO do Banheiro Sustentável

Mecânicas a planejar: metas semanais, streaks, comparação com perfis e
compartilhamento social.

---

## 8. Entidades de dados (rascunho para modelagem)

- **User** — perfil, preço do rolo configurado, perfil de consumo, metas.
- **Registro diário** — data, idas ao banheiro, voltas na mão, usou água (bool).
- **Métricas calculadas** — folhas, rolos, custo, água, CO₂, economia (derivadas,
  por dia/semana/mês).
- **Badge / Conquista** — definição, critério de desbloqueio, estado por usuário.
- **Meta / Desafio** — período, alvo, progresso.

---

## 9. Potencial de evolução (fora do MVP)

- Consumo consciente doméstico (além do papel).
- Métricas ambientais pessoais.
- Economia residencial agregada.
- Marketplace sustentável.
- Integração com casas inteligentes.

---

## 10. Pontos em aberto para decidir antes de codar

1. **Constante de CO₂ por rolo** — a fonte cita CO₂ mas não dá o número. Definir.
2. **Preço do rolo** — input do usuário, valor regional padrão, ou ambos?
3. **Efeito da água/ducha** — "usou água" só desbloqueia badge ou também reduz
   o cálculo de folhas? Precisa de regra.
4. **"Mês" = 30 dias fixos ou dias reais?**
5. **Plataforma** — web, mobile (app nativo / React Native), ou PWA?
6. **Persistência** — local-only no MVP ou backend com conta desde o início?
7. **Escopo do MVP** — sugestão: registro diário + cálculo + dashboard. Badges,
   metas e social entram numa segunda fase.

---

## Frases de impacto (tom da marca)

- "Cada folha conta."
- "Seu banheiro também pode salvar o planeta."
- "Sustentabilidade começa nas pequenas voltas."
