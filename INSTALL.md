# Instalar este template num projeto existente

Instruções para o agente. O humano pede algo como: "Clone o template numa pasta
temporária, leia o INSTALL.md e instale neste projeto." Para um projeto **novo**, não use
este arquivo: veja o README.md.

- **TEMPLATE**: a pasta temporária onde o template foi clonado.
- **ALVO**: o projeto onde o template será instalado (o diretório atual da sessão).

## Regras

- Não use instaladores, plugins ou marketplaces. Copie arquivos do TEMPLATE.
- Nunca sobrescreva um arquivo do ALVO. Quando ele já existir, junte o conteúdo como
  descrito na seção 3. Em conflito que não esteja coberto aqui, pare e pergunte.
- Não faça commit. Pare na seção 6 e espere aprovação.
- Apague a pasta TEMPLATE no final.

## 1. Pré-requisitos

Confira e informe: `node --version` (22.12 ou mais), `git --version`, `openspec --version`.
Se o OpenSpec não estiver instalado, **não instale**: peça ao humano que rode
`npm install -g @fission-ai/openspec@latest`, e espere.

## 2. Diagnóstico (somente leitura)

Levante e apresente num relatório:

1. **Arquivos que já existem no ALVO**: `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`,
   `.claude/hooks/`, `openspec/`, `scripts/check-scenario-tests.mjs`.
2. **Colisões de nome**: para cada skill e agente da seção 3, diga se já existe uma pasta
   ou arquivo com o mesmo nome em `.claude/skills/` ou `.claude/agents/` do ALVO.
3. **Branch principal**: `git symbolic-ref --short refs/remotes/origin/HEAD`; sem remoto,
   a branch atual. Se houver dúvida, pergunte.
4. **Stack e comandos**: leia os manifestos e o CI (`package.json`, `pyproject.toml`,
   `go.mod`, `Cargo.toml`, `Makefile`, `.github/workflows/` etc.) e proponha a Stack e os
   comandos de teste, lint e build. Não invente: o que não achar, deixe como `<preencha>`.
5. **Ferramentas do agente**: pergunte para quais agentes rodar o `openspec init`
   (padrão: `claude`). Este fluxo completo só funciona no Claude Code.

Apresente também o plano de cópia e de junção da seção 3, item a item.
**Pare e espere aprovação do plano.**

## 3. Copiar e juntar

### Copiar (o destino não pode existir; se existir, foi listado no diagnóstico)

| Do TEMPLATE | Para o ALVO |
|---|---|
| `.claude/skills/` `review-change`, `ecc-security-review`, `grill-with-docs`, `grilling`, `domain-modeling`, `tdd`, `codebase-design`, `pr`, `diagnosing-bugs`, `retro`, `writing-for-agents` | mesmo caminho |
| `.claude/agents/code-reviewer.md`, `.claude/agents/security-reviewer.md` | mesmo caminho |
| `.claude/hooks/guard-archive.mjs` | mesmo caminho |
| `.claude/vendor/` | mesmo caminho |
| `scripts/check-scenario-tests.mjs` | mesmo caminho |
| `openspec/changes/archive/README.md` | mesmo caminho |

**Não copie**: `.claude/skills/openspec-*`, `.claude/commands/`, `.agents/` (o
`openspec init` gera para a versão instalada), `openspec/specs/*`, `openspec/changes/*`
(exceto o README do archive), `README.md`, `INSTALL.md` e `.git/` do template.

### Juntar

- **`AGENTS.md`**: se não existir, copie. Se existir, preserve todo o conteúdo do ALVO e
  acrescente as seções do template que faltarem. Regra do ALVO que contradiga uma do
  template: mostre as duas e pergunte qual vale.
- **`CLAUDE.md`**: se não existir, copie. Se existir, garanta que ele contém a linha
  `@AGENTS.md` e preserve o resto.
- **`.claude/settings.json`**: se não existir, copie. Se existir, acrescente a entrada de
  `PreToolUse` do hook `guard-archive` e preserve todo o resto (permissões, outros hooks).
  Se já houver um `PreToolUse` com o mesmo `matcher`, acrescente o hook à lista dele.
- **`openspec/config.yaml`**: se não existir, copie. Se existir, preserve `schema` e o
  `context` do ALVO e acrescente os blocos de `context`, `rules` e `operations` do
  template. Todo item de lista que contenha `": "` fica entre aspas simples.

### Preencher

No `openspec/config.yaml` e no `AGENTS.md`: Stack, comandos e "Branch principal", com o
que foi aprovado no diagnóstico.

## 4. Inicializar o OpenSpec

No ALVO: `openspec init --tools <ferramentas aprovadas>`. Confirme que a saída diz
"Config: openspec/config.yaml (exists)" e que o `config.yaml` não mudou.

## 5. Verificar

1. Instruções do OpenSpec, com uma change temporária `install-teste`:
   - "ignoring" deve dar 0 em proposal, specs, design, tasks, apply e archive;
   - "Critérios de aceite" (proposal), "Crie sempre" e "Superfície de segurança" (design)
     e "verification.md" (apply) devem aparecer.
2. Hook: sem `review.md`, `openspec archive install-teste -y` e um `Write` em
   `openspec/specs/teste/spec.md` devem dar exit 2; `ls` deve dar 0. Exemplo:
   `printf '%s' '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | CLAUDE_PROJECT_DIR="$PWD" node .claude/hooks/guard-archive.mjs; echo $?`
3. `node scripts/check-scenario-tests.mjs` roda sem erro.
4. Referências entre skills: toda skill citada por outra está instalada.

Apague a change `install-teste`.

5. Com a change `install-teste` já apagada, `openspec validate --all --strict` passa.

## 6. Entregar

Apresente: tabela do que foi copiado, juntado e preenchido; o resultado da verificação;
os diffs dos arquivos juntados; e o `git status`. Sugira o commit
"chore: instala template de desenvolvimento com OpenSpec" e **espere aprovação**.

Termine lembrando o humano de reiniciar o agente para carregar o hook e as skills.
