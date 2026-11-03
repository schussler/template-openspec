# AGENTS.md

Instruções para agentes de código neste repositório. Este arquivo é a fonte única de
verdade: arquivos específicos de ferramenta (como `CLAUDE.md`) apenas importam este e
acrescentam o mínimo que é exclusivo daquela ferramenta. Ao mudar uma regra, mude aqui.

O fluxo completo (TDD, revisão em contexto novo, hook de archive) funciona no Claude Code.
Outros agentes têm só as skills do OpenSpec, em `.agents/skills/`.

## Comandos do projeto

- Testes: `<preencha>`
- Lint: `<preencha>`
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

### Como acionar cada etapa

As etapas são *skills* em formato aberto (`SKILL.md`). Use a forma que a sua
ferramenta suporta — ou simplesmente peça em linguagem natural
("proponha uma mudança para…", "aplique a mudança add-auth").

| Etapa | Skill | Claude Code | Outros agentes (`.agents/skills`) |
|---|---|---|---|
| Explorar | `openspec-explore` | `/opsx:explore` | `/openspec-explore` |
| Propor | `openspec-propose` | `/opsx:propose` | `/openspec-propose` |
| Aplicar | `openspec-apply-change` | `/opsx:apply` | `/openspec-apply-change` |
| Atualizar | `openspec-update-change` | `/opsx:update` | `/openspec-update-change` |
| Sincronizar | `openspec-sync-specs` | `/opsx:sync` | `/openspec-sync-specs` |
| Arquivar | `openspec-archive-change` | `/opsx:archive` | `/openspec-archive-change` |

Comandos da CLI do OpenSpec:

```bash
openspec list                         # mudanças ativas (--specs para listar specs)
openspec show <nome>                  # ver uma mudança ou spec
openspec status --change <nome>       # progresso dos artefatos
openspec instructions <artefato> --change <nome>   # instruções para gerar um artefato
openspec validate <nome>              # validar mudança/spec
openspec archive <nome>               # arquivar mudança concluída
```

### Regras

- Funcionalidade nova, mudança de comportamento ou de arquitetura: comece por uma
  proposta.
- Não implemente durante *explorar* nem *propor*: essas etapas produzem apenas
  artefatos de planejamento.
- Só uma frase explícita do humano aprovando a implementação da versão apresentada
  autoriza o *aplicar*. Silêncio, esclarecimentos, continuidade da conversa ou aprovação
  de uma decisão isolada **não** são autorização. Se o humano pedir ajustes, atualize a
  change e reapresente.
- Durante *aplicar*, siga `tasks.md`; se o plano se mostrar errado, pare e
  *atualize* a mudança em vez de improvisar.
- Rode `openspec validate <nome>` antes de pedir revisão ou arquivar.
- A revisão deste projeto é a skill `review-change`. Não use a skill nativa
  `code-review` nem o comando nativo `/security-review`. Os agentes `code-reviewer` e
  `security-reviewer` só são despachados pela `review-change`. Quando uma skill citar
  `code-review`, entenda `review-change`.
- Toda mudança de comportamento passa por uma change do OpenSpec. Não altere
  comportamento coberto por `openspec/specs/` fora de uma change.
- Correções que não mudam comportamento (refatoração, typo, dependência, ajuste óbvio)
  podem ser feitas sem change, mas confirme que nenhuma spec ficou desatualizada.
- Se o código divergir de `openspec/specs/`, não corrija nenhum dos dois em silêncio:
  registre a divergência e pergunte qual lado representa a intenção.
- Não reescreva uma spec para legitimar um possível bug.
- Implemente com a skill `tdd`: um teste falhando por vez, depois o código mínimo.
- Decisão que vale só para a change vai no `design.md`; decisão que vale além dela
  vira ADR em `docs/adr/` (skill `domain-modeling`); vocabulário vai no `GLOSSARY.md`.
- A refatoração não acontece dentro do ciclo da `tdd`: ela entra como correção de um
  achado da `review-change`, com a autorização do humano.
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
- Quando o comando de testes for definido, a mesma change acrescenta os testes ao workflow
  `.github/workflows/openspec.yml` e cria um hook de pre-commit que roda os testes,
  `openspec validate --all --strict` e `node scripts/check-scenario-tests.mjs`.
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
