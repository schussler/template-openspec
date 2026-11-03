# AGENTS.md

Instruções para agentes de código neste repositório. Este arquivo é a fonte única de
verdade: arquivos específicos de ferramenta (como `CLAUDE.md`) apenas importam este e
acrescentam o mínimo que é exclusivo daquela ferramenta. Ao mudar uma regra, mude aqui.

O fluxo completo (TDD, revisão em contexto novo, hook de archive) funciona no Claude Code.
Outros agentes têm só as skills do OpenSpec, em `.agents/skills/`.

## Comandos do projeto

- Testes, lint e tipos: veja `template.json` → `checks`.
- Branch principal: `main`

## Desenvolvimento orientado a specs (OpenSpec)

Este projeto usa [OpenSpec](https://openspec.dev/): antes de escrever código de
uma mudança não trivial, humano e agente concordam por escrito sobre **o que**
será construído.

### Estrutura

| Caminho | O que é |
|---|---|
| `openspec/specs/` | Specs atuais — a verdade sobre como o sistema se comporta hoje. |
| `openspec/changes/<nome>/` | Uma mudança em andamento: `proposal.md` (o quê e por quê), `specs/` (deltas), `design.md` (como), `tasks.md` (checklist). |
| `openspec/changes/archive/` | Mudanças concluídas. Não edite. |
| `openspec/config.yaml` | Schema do fluxo, contexto do projeto e regras por artefato. |

### Fluxo

| Fase | Como acionar | Saída | Para avançar |
|---|---|---|---|
| 0. Alinhar (opcional) | `/grill-with-docs` (só o humano) | `GLOSSARY.md`, `docs/adr/` | o humano confirma o entendimento |
| 1. Explorar (opcional) | `/opsx:explore` | nada em disco | o humano pede a proposta |
| 2. Propor | `/opsx:propose` | `proposal.md` (com CA-n), `specs/`, `design.md`, `tasks.md` | **aprovação explícita do humano** |
| 3. Aplicar | `/opsx:apply` com a skill `tdd` | código, testes e docs afetadas | todas as tarefas de implementação marcadas |
| 4. Revisar | skill `review-change` | `review.md` com `VERDICT:` | `VERDICT: APPROVED` |
| 5. Verificar | grupo "Verificação" do `tasks.md` | `verification.md` | o humano pede o archive |
| 6. Arquivar | `/opsx:archive` (protegido pelo hook) | `openspec/specs/` atualizado | — |
| 7. PR | skill `pr` | corpo do PR | o humano confirma antes de abrir |

Também existem: **atualizar** (`/opsx:update`, revisar artefatos de uma change existente)
e **sincronizar** (`/opsx:sync`, aplicar deltas às specs sem arquivar).

Comandos da CLI: `openspec --help`.

### Antes de alterar código: classifique

Para qualquer pedido que altere código, diga em uma linha, antes de começar, qual é o
tipo, e espere o humano confirmar se houver dúvida:

| Tipo | Critério | Caminho |
|---|---|---|
| **A** | Ninguém de fora percebe a diferença: typo, texto interno, refatoração, dependência, lint | Sem change. Rode testes e lint e confirme que nenhuma spec ficou desatualizada |
| **B** | Muda um comportamento existente, de forma localizada | Change curta: proposal e design de poucas linhas, mesmos portões da change completa (`docs/prompts/mudanca-pequena.md`) |
| **C** | Capacidade nova, ou mudança relevante de comportamento, arquitetura ou contratos | Change completa (`docs/prompts/sessao.md`) |

Correção de bug: se a spec já descreve o comportamento correto, é tipo A, com um teste
nomeado `<capability> / <cenário>` que reproduz o bug. Se o certo for o código e não a
spec, é tipo B. Na dúvida sobre qual lado está certo, pergunte antes.

### Regras

- Não implemente durante *explorar* nem *propor*: essas etapas produzem apenas
  artefatos de planejamento.
- Só uma frase explícita do humano aprovando a implementação da versão apresentada
  autoriza o *aplicar*. Silêncio, esclarecimentos, continuidade da conversa ou aprovação
  de uma decisão isolada **não** são autorização. Se o humano pedir ajustes, atualize a
  change e reapresente.
- A revisão deste projeto é a skill `review-change`. Não use a skill nativa
  `code-review` nem o comando nativo `/security-review`. Os agentes `code-reviewer` e
  `security-reviewer` só são despachados pela `review-change`.
- Toda mudança de comportamento passa por uma change do OpenSpec. Não altere
  comportamento coberto por `openspec/specs/` fora de uma change.
- Se o código divergir de `openspec/specs/`, não corrija nenhum dos dois em silêncio:
  registre a divergência e pergunte qual lado representa a intenção.
- Não reescreva uma spec para legitimar um possível bug.
- Decisão que vale só para a change vai no `design.md`; decisão que vale além dela
  vira ADR em `docs/adr/` (skill `domain-modeling`); vocabulário vai no `GLOSSARY.md`.
- A skill `diagnosing-bugs` serve para investigar até a causa e ter um teste que
  reproduz o bug. A correção de um bug que altera comportamento vira uma change, mesmo
  que pequena.
- A skill `retro` só é chamada pelo humano, com `/retro`. As sugestões que o humano
  aceitar mudam a configuração do agente, não o comportamento do produto: aplique-as
  num commit `chore:` separado, sem abrir change do OpenSpec.
- Padrões de código que dependem de julgamento ficam em `CODING_STANDARDS.md`, lido na
  revisão. Padrões mecânicos viram checagem automática (lint, teste, hook ou CI), não
  regra escrita.
- Cada cenário de `openspec/specs/` tem um teste cujo nome contém
  `<capability> / <nome do cenário>`. `node scripts/check-scenario-tests.mjs` confere.
- A change que define a stack preenche `template.json` → `checks` (`test`, `lint`,
  `typecheck`) e cria um hook de pre-commit que roda `node scripts/gates/implement-gate.mjs`,
  `openspec validate --all --strict` e `node scripts/check-scenario-tests.mjs`. O CI roda o
  gate quando `checks.test` estiver preenchido.
- `openspec/changes/archive/` é histórico e não é fonte de comportamento atual. O
  comportamento atual está em `openspec/specs/` e no código. Consulte o archive só para
  entender por que algo foi feito, e confirme o que encontrar contra as specs, os ADRs e
  o código. Em buscas no repositório, exclua `openspec/changes/archive/`, a menos que a
  pergunta seja histórica.

## Arquivos gerados — não edite à mão

Os arquivos abaixo são gerados pelo OpenSpec e sobrescritos em cada atualização:

- `.agents/skills/openspec-*/` — skills para agentes que leem `.agents/skills` (alvo universal)
- `.claude/skills/openspec-*/` e `.claude/commands/opsx/` — integração do Claude Code

Para customizar o fluxo, use `openspec/config.yaml` (`context`, `rules`,
`operations`). Para atualizar após subir a versão da CLI:

```bash
npm install -g @fission-ai/openspec@latest
openspec update
```

Para adicionar outra ferramenta com integração nativa (comandos próprios), rode
`openspec init --tools <id>` (ex.: `cursor`, `codex`, `gemini`, `github-copilot`)
— `openspec init --help` lista os ids. Ferramentas que já leem `.agents/skills`
funcionam sem passo extra.
