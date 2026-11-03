# Template: desenvolvimento guiado por specs com OpenSpec

Fluxo: entrevista → proposta com critérios de aceite → aprovação humana → implementação
com TDD → revisão em contexto novo → verificação → archive → PR. Funciona no Claude Code.

| Peça | Origem |
|---|---|
| Ciclo de changes e specs | OpenSpec |
| `grill-with-docs`, `grilling`, `domain-modeling`, `tdd`, `codebase-design`, `pr`, `diagnosing-bugs`, `retro`, `writing-for-agents` | mattpocock/skills (MIT) |
| `code-reviewer`, `security-reviewer`, `ecc-security-review` | ECC (MIT) |
| `review-change`, hook `guard-archive`, `check-scenario-tests`, `implement-gate`, `check-template` | este template |

Versões exatas em `template.json` → `upstreams`; licenças em `.claude/vendor/`.

## Projeto novo

1. Crie o repositório a partir deste template ("Use this template" no GitHub) e clone.
2. Requisitos: Node.js 22.12+, Git e o OpenSpec (`npm install -g @fission-ai/openspec@latest`).
3. Rode `openspec update` para alinhar os arquivos gerados à sua versão do OpenSpec.
4. Apague o INSTALL.md, o UPDATE.md e o CHANGELOG.md, apague ou reescreva este README para
   o seu produto e deixe `template_only` vazio (`[]`) no `template.json`.
5. Abra o Claude Code. A primeira change é a definição da stack, com o prompt
   `docs/prompts/stack.md` (antes, `/grill-with-docs` se a stack estiver em aberto). Ela
   preenche a Stack no `openspec/config.yaml` e os comandos em `template.json` → `checks`,
   e liga o gate no CI e o hook de pre-commit (veja "Testes por cenário").
   Para cada tarefa, escolha o prompt em `docs/prompts/README.md`, preencha os campos
   entre colchetes e cole no chat.

## Projeto existente

Peça ao agente, na raiz do projeto:

> Clone <url deste template> numa pasta temporária, leia o INSTALL.md e siga-o para
> instalar neste projeto.

O agente diagnostica o projeto, mostra o plano, junta os arquivos sem sobrescrever e para
antes do commit.

## Atualizar um projeto

Peça ao agente, na raiz do projeto:

> Clone <url deste template> numa pasta temporária, leia o UPDATE.md e siga-o para
> atualizar este projeto.

O agente compara a versão instalada (`template.json` → `template.version`) com a nova,
mostra o CHANGELOG e o plano, e para antes de aplicar. Arquivos de `owned` nunca são
sobrescritos; arquivos de `managed` editados no projeto viram conflito e só mudam com a
sua decisão.

## Testes por cenário

Cada cenário de `openspec/specs/` tem um teste cujo nome contém
`<capability> / <nome do cenário>`, por exemplo `invites / Código expirado`.
`node scripts/check-scenario-tests.mjs` lista os cenários sem teste
(`--change <nome>` confere uma change em andamento).

## Garantias e limites

- **Bloqueio técnico**: o hook `guard-archive` impede alterar `openspec/specs/` ou arquivar
  uma change sem `review.md` com `VERDICT: APPROVED` e `verification.md`.
- **Instruções**: aprovação humana, TDD, revisão e atualização de docs dependem de o
  agente seguir `AGENTS.md` e `openspec/config.yaml`.
- **Atualidade das specs**: depende de os testes rodarem sempre. O CI roda o gate de
  implementação quando `template.json` → `checks.test` estiver preenchido; a change que
  define a stack cria também o hook de pre-commit. O que nenhuma checagem pega (teste com
  o nome certo que verifica outra coisa, comportamento sem spec, docs fora de `openspec/`)
  fica para a auditoria periódica, com `docs/prompts/auditoria.md`.
