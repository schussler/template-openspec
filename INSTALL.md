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
   `.claude/hooks/`, `openspec/`, `scripts/`, `template.json`.
2. **Colisões de nome**: para cada caminho de `managed` no `template.json` do TEMPLATE,
   diga se ele já existe no ALVO.
3. **Branch principal**: `git symbolic-ref --short refs/remotes/origin/HEAD`; sem remoto,
   a branch atual. Se houver dúvida, pergunte.
4. **Stack e comandos**: leia os manifestos e o CI (`package.json`, `pyproject.toml`,
   `go.mod`, `Cargo.toml`, `Makefile`, `.github/workflows/` etc.) e proponha a Stack, o
   comando de build e os comandos de teste, lint e checagem de tipos (`checks.test`,
   `checks.lint` e `checks.typecheck` do `template.json`). Não invente: o que não achar,
   deixe como `<preencha>` (no `template.json`, `null`). Se o projeto não tiver checador
   de tipos, pergunte ao humano se `checks.typecheck` deve ser `false` ("não se aplica":
   o gate pula esse check).
5. **Ferramentas do agente**: pergunte para quais agentes rodar o `openspec init`
   (padrão: `claude`). Este fluxo completo só funciona no Claude Code.

Apresente também o plano de cópia e de junção da seção 3, item a item.
**Pare e espere aprovação do plano.**

## 3. Copiar e juntar

### Copiar (o destino não pode existir; se existir, foi listado no diagnóstico)

Copie para o mesmo caminho no ALVO:

- cada caminho de `managed` no `template.json` do TEMPLATE;
- `openspec/changes/archive/README.md`;
- `.github/workflows/openspec.yml` (se o ALVO já tiver um workflow com esse nome, pergunte).

**Não copie**: `.claude/skills/openspec-*`, `.claude/commands/`, `.agents/` (o
`openspec init` gera para a versão instalada), `openspec/specs/*`, `openspec/changes/*`
(exceto o README do archive), os arquivos de `template_only` e o `.git/` do template.

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
- **`template.json`**: se não existir, copie. Se existir, preserve os campos do ALVO e
  acrescente os campos do template que faltarem e, em `managed` e `owned`, os caminhos do
  template que faltarem. Nos dois casos, deixe `template_only` vazio (`[]`): ele só vale
  no repositório do template.

### Preencher

Com o que foi aprovado no diagnóstico:

- `openspec/config.yaml`: Stack e Build.
- `AGENTS.md`: "Branch principal".
- `template.json`: `checks.test`, `checks.lint` e `checks.typecheck` (o que não foi
  aprovado fica `null`), e `template.version` com a versão do TEMPLATE.

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
5. `node scripts/check-template.mjs` passa.

Apague a change `install-teste`.

6. Com a change `install-teste` já apagada, `openspec validate --all --strict` passa.

## 6. Entregar

Apresente: tabela do que foi copiado, juntado e preenchido; o resultado da verificação;
os diffs dos arquivos juntados; e o `git status`. Sugira o commit
"chore: instala template de desenvolvimento com OpenSpec" e **espere aprovação**.

Termine lembrando o humano de reiniciar o agente para carregar o hook e as skills.
