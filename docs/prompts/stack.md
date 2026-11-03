# Prompt: definir a stack (primeira change)

Use uma vez, antes de qualquer outra change, enquanto `template.json` → `checks.test`
estiver `null`. É uma change tipo C: liga os testes, o gate de implementação no CI e o hook
de pre-commit, que mantêm specs e código alinhados a partir daí. Se ainda houver escolhas
em aberto (linguagem, framework, banco, hospedagem), faça antes o `grill.md`.

---

Atue como líder técnico sênior. Esta sessão define a stack do projeto e liga as checagens
automáticas. Siga o ciclo do OpenSpec descrito em `AGENTS.md`, com as paradas de aprovação.

## STACK

[Linguagem e versão, framework, banco, hospedagem, gerenciador de pacotes. Se o projeto já
tem código, escreva "detectar do código".]

## ETAPA 1 — DIAGNÓSTICO E CHANGE

- Leia `AGENTS.md`, `openspec/config.yaml`, `template.json`, `GLOSSARY.md` e `docs/adr/`.
- Se o projeto já tem código, leia os manifestos e o CI (`package.json`, `pyproject.toml`,
  `go.mod`, `Cargo.toml`, `Makefile` etc.) e proponha a stack a partir deles. Não invente
  comandos: o que não achar, pergunte.
- Crie a change com a skill `openspec-propose`. Esta change não muda comportamento: declare
  `skip_specs: true` no `.openspec.yaml` dela, senão o `openspec validate` falha por falta
  de delta. Ela entrega:
  - `openspec/config.yaml` → `context`: Stack e Build;
  - `template.json` → `checks`: `test`, `lint` e `typecheck`. Use `false` só no que não se
    aplica (por exemplo, `typecheck` sem checador de tipos), com a minha confirmação;
  - um teste de exemplo que passa, para provar que `checks.test` roda;
  - o hook de pre-commit em `.githooks/pre-commit`, ativado com
    `git config core.hooksPath .githooks`, rodando `node scripts/gates/implement-gate.mjs`,
    `openspec validate --all --strict` e `node scripts/check-scenario-tests.mjs`;
  - em `.github/workflows/openspec.yml`, o preparo do ambiente que os checks precisam
    (instalar a linguagem e as dependências) antes do passo "gate de implementação";
  - um ADR em `docs/adr/` com a escolha da stack e as alternativas descartadas (skill
    `domain-modeling`).

## PARADA OBRIGATÓRIA — APROVAÇÃO DA CHANGE

Mostre a stack, os três comandos de `checks` e o que cada um roda, o caminho da change e as
decisões pendentes. Peça aprovação explícita e aguarde.

## ETAPA 2 — IMPLEMENTAÇÃO E VERIFICAÇÃO

- Implemente com a skill `openspec-apply-change`.
- `node scripts/gates/implement-gate.mjs` precisa sair com 0, com os comandos reais.
- Faça um commit de teste com um teste quebrado e confirme que o pre-commit bloqueia;
  depois desfaça.
- Rode a skill `review-change` até `VERDICT: APPROVED` e escreva o `verification.md`.

## ANTES DE ENCERRAR — DOCUMENTAÇÃO

- Procure, de forma literal, `<preencha>` em `AGENTS.md`, `openspec/config.yaml`,
  `README.md` e `docs/`, e preencha o que esta change definiu.
- Confira se o README descreve como instalar, testar e rodar o projeto com a stack nova.
- Confira se o README explica que cada clone precisa rodar
  `git config core.hooksPath .githooks` para ativar o pre-commit.
- Liste exatamente os documentos e as seções conferidos.

## ENTREGA

1. A stack, os comandos de `checks` e a tabela do gate com os três passando.
2. A prova de que o pre-commit bloqueia um teste quebrado.
3. O veredito do `review.md` e as pendências.

Não arquive. Termine perguntando se pode arquivar a change.
