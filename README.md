# Template: desenvolvimento guiado por specs com OpenSpec

Fluxo: entrevista → proposta com critérios de aceite → aprovação humana → implementação
com TDD → revisão em contexto novo → verificação → archive → PR. Funciona no Claude Code.

| Peça | Origem |
|---|---|
| Ciclo de changes e specs | OpenSpec |
| `grill-with-docs`, `grilling`, `domain-modeling`, `tdd`, `codebase-design`, `pr`, `diagnosing-bugs`, `retro`, `writing-for-agents` | mattpocock/skills (MIT) |
| `code-reviewer`, `security-reviewer`, `ecc-security-review` | ECC (MIT) |
| `review-change`, hook `guard-archive`, `check-scenario-tests` | este template |

Versões exatas e licenças em `.claude/vendor/`.

## Projeto novo

1. Crie o repositório a partir deste template ("Use this template" no GitHub) e clone.
2. Requisitos: Node.js 22.12+, Git e o OpenSpec (`npm install -g @fission-ai/openspec@latest`).
3. Rode `openspec update` para alinhar os arquivos gerados à sua versão do OpenSpec.
4. Apague este README e o INSTALL.md, ou reescreva-os para o seu produto.
5. Abra o Claude Code. A primeira change é a definição da stack: rode `/grill-with-docs` e
   depois proponha a change. Ela preenche Stack e Comandos no `openspec/config.yaml` e no
   `AGENTS.md` e liga os testes (veja "Testes por cenário").

## Projeto existente

Peça ao agente, na raiz do projeto:

> Clone <url deste template> numa pasta temporária, leia o INSTALL.md e siga-o para
> instalar neste projeto.

O agente diagnostica o projeto, mostra o plano, junta os arquivos sem sobrescrever e para
antes do commit.

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
- **Atualidade das specs**: depende de os testes rodarem sempre. Quando a stack for
  definida, ligue testes, `openspec validate --all --strict` e o `check-scenario-tests`
  num hook de pre-commit ou no CI.
