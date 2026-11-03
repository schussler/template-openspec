# Changelog

Uma seção por versão, da mais nova para a mais antiga. Cada versão corresponde à tag
`v<versão>`. O UPDATE.md mostra as seções entre a versão instalada e a nova.

## 0.2.0 — 2026-11-03

### Adicionado

- `template.json`: versão do template, versões dos upstreams, comandos do projeto
  (`checks.test`, `checks.lint`, `checks.typecheck`) e o manifesto `managed`, `owned` e
  `template_only`.
- `scripts/gates/implement-gate.mjs`: roda os `checks` com tempo limite e mostra uma tabela
  com o resultado. Um check `false` não se aplica e é pulado. O apply exige que ele saia com 0 antes da `review-change`. A
  `review-change` registra cada check que falha como achado HIGH e bloqueia quando os
  checks não estão configurados.
- `scripts/check-template.mjs`: confere o manifesto e procura caminhos pessoais e tokens
  nos arquivos `managed`.
- `UPDATE.md`: atualização de um projeto por comparação em três vias (projeto, versão
  instalada, versão nova), com conflitos decididos pelo humano.
- Prompts por cenário em `docs/prompts/`: investigação, grill, mudança pequena, sessão e
  design, com um README para escolher entre eles. Cada um termina com uma etapa de
  documentação antes de encerrar.
- `docs/prompts/stack.md` (primeira change: define a stack, liga o gate no CI e o
  pre-commit) e `docs/prompts/auditoria.md` (revisão periódica, só leitura, do que as
  checagens não pegam). O `AGENTS.md` recomenda a change da stack enquanto
  `checks.test` for `null`.
- `AGENTS.md`: "Antes de alterar código: classifique", com os tipos A (sem change), B
  (change curta) e C (change completa). Substitui as regras de começar por proposta e de
  correções sem change.
- Autoteste do hook `guard-archive` (`.claude/hooks/guard-archive.selftest.mjs`), rodado
  no CI.
- CI: autotestes do gate e do `check-template`, a checagem do manifesto e o gate, quando
  `checks.test` estiver preenchido.

### Alterado

- Os comandos de teste, lint e tipos ficam só em `template.json` → `checks`. O
  `AGENTS.md` e o `openspec/config.yaml` apontam para lá.
- O INSTALL.md copia os caminhos de `managed`, junta o `template.json` e preenche `checks`
  e a versão.

### Corrigido

- Hook `guard-archive`: voltou a bloquear `git mv` e passou a reconhecer `npx`, `sudo`,
  `env` e o executável por caminho absoluto (`/usr/local/bin/openspec`).
- `check-specs-archived`: não mostra mais o "fatal: path ... exists on disk" do git quando
  a pasta de archive é nova.

## 0.1.0 — 2026-11-03

Primeira versão, sem `template.json`. Projetos instalados nela adotam o manifesto pelo
INSTALL.md.

- OpenSpec 1.16.0 com regras por artefato e por operação em `openspec/config.yaml`:
  critérios de aceite, cenários com teste, design com reconciliação, documentação afetada,
  superfície de segurança e seams de teste, e grupo final de verificação.
- Skills de mattpocock/skills e do ECC, agentes `code-reviewer` e `security-reviewer` e a
  skill `review-change`, que revisa a change em contexto novo e grava o `review.md` com
  veredito.
- Hook `guard-archive`: bloqueia o archive e escritas em `openspec/specs/` sem `review.md`
  aprovado e `verification.md`.
- Convenção de testes por cenário, com `check-scenario-tests` e autoteste.
- `AGENTS.md` com o fluxo, a regra de aprovação explícita e o archive como histórico;
  prompt de sessão em `docs/prompt-sessao.md`.
- README e INSTALL.md para projetos novos e existentes.
- CI: `openspec validate --all --strict`, `check-scenario-tests` e, em PRs, a exigência de
  archive aprovado quando `openspec/specs/` muda.
