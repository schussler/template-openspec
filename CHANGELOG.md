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
- CI: autotestes do gate e do `check-template`, a checagem do manifesto e o gate, quando
  `checks.test` estiver preenchido.

### Alterado

- Os comandos de teste, lint e tipos ficam só em `template.json` → `checks`. O
  `AGENTS.md` e o `openspec/config.yaml` apontam para lá.
- O INSTALL.md copia os caminhos de `managed`, junta o `template.json` e preenche `checks`
  e a versão.

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
