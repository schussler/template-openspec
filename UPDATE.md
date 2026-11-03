# Atualizar um projeto que usa este template

Instruções para o agente. O humano pede algo como: "Clone o template numa pasta
temporária, leia o UPDATE.md e atualize este projeto." Para instalar o template pela
primeira vez, use o INSTALL.md.

- **ALVO**: o projeto que será atualizado (o diretório atual da sessão).
- **NOVA**: pasta temporária com o template na versão nova.
- **INSTALADA**: pasta temporária com o template na versão que o ALVO tem hoje.

## Regras

- Não use instaladores, plugins ou marketplaces. Copie arquivos da NOVA.
- Nunca altere um arquivo de `owned` do ALVO. Mudanças do template nesses arquivos viram
  sugestões, aplicadas só com aprovação.
- Arquivo de `managed` editado no ALVO só muda com decisão do humano, arquivo por arquivo.
- Não faça commit. Pare nas etapas 5 e 7 e espere aprovação.
- Apague as pastas NOVA e INSTALADA no final.

## 1. Ler o manifesto do ALVO

Leia o `template.json` do ALVO e informe a versão instalada (`template.version`), os
`upstreams` e as listas `managed` e `owned`.

- Sem `template.json`: o projeto é anterior à versão 0.2.0. Pare e explique que é preciso
  instalar o manifesto pelo INSTALL.md, que junta os arquivos sem sobrescrever.
- `template_only` não vazio: o ALVO é o próprio repositório do template. Pare.

## 2. Clonar as duas versões

As versões são tags `v<versão>` em `template.repo`. A nova é a que o humano pedir; se ele
não disser, a mais recente (`git ls-remote --tags --sort=-v:refname <repo> 'v*'`).

```bash
git clone -q --depth 1 --branch v<nova> <repo> <NOVA>
git clone -q --depth 1 --branch v<instalada> <repo> <INSTALADA>
```

Se a versão instalada já é a nova, diga que o ALVO está atualizado e pare.

## 3. Classificar os arquivos de `managed`

Caminhos: os de `managed` do ALVO mais os que o `managed` da NOVA acrescentou. Expanda as
pastas em arquivos, juntando os arquivos que existem em qualquer uma das três cópias.
Compare o conteúdo com `cmp -s`; arquivo ausente conta como um conteúdo próprio.

Para cada arquivo, ALVO × INSTALADA diz se houve edição local, e INSTALADA × NOVA diz se
o template mudou. Aplique a primeira linha que servir:

| Situação | Classe |
|---|---|
| ALVO igual à NOVA | sem mudança (não liste) |
| ALVO igual à INSTALADA, e o arquivo só existe na NOVA | **novo** |
| ALVO igual à INSTALADA, e o arquivo não existe na NOVA | **removido no template** |
| ALVO igual à INSTALADA, e INSTALADA diferente da NOVA | **atualizar** |
| ALVO diferente da INSTALADA, e INSTALADA diferente da NOVA | **conflito** |
| ALVO diferente da INSTALADA, e INSTALADA igual à NOVA | edição local (mantida) |

Arquivo apagado no ALVO conta como edição local.

## 4. Conferir os arquivos de `owned`

Não altere nenhum. Para cada arquivo de `owned` que mudou entre INSTALADA e NOVA (em
especial `AGENTS.md`, `openspec/config.yaml` e `.github/workflows/openspec.yml`), mostre o
diff INSTALADA × NOVA e proponha como juntar cada regra nova ao arquivo do ALVO. Liste
essas sugestões separadamente do plano da etapa 3.

## 5. Mostrar o plano

Apresente:

1. as seções do `CHANGELOG.md` da NOVA entre a versão instalada (exclusive) e a nova;
2. a tabela da etapa 3, agrupada por classe;
3. para cada conflito, o diff ALVO × INSTALADA (a edição local) e o diff INSTALADA × NOVA
   (a mudança do template);
4. as sugestões da etapa 4;
5. se `upstreams.openspec` mudou, o comando para o humano instalar a versão nova do
   OpenSpec (`npm install -g @fission-ai/openspec@<versão>`). Não instale.

**Pare e espere aprovação do plano.**

## 6. Aplicar

- **atualizar** e **novo**: copie da NOVA.
- **removido no template**: apague só os que o humano aprovou.
- **conflito**: um arquivo por vez. Proponha a versão junta, mostre-a e aplique só depois
  da decisão do humano sobre aquele arquivo.
- **sugestões de `owned`**: aplique só as aprovadas, preservando o resto do arquivo.

## 7. Registrar e verificar

1. No `template.json` do ALVO: grave `template.version` e `upstreams` da NOVA e acrescente
   a `managed` os caminhos novos que foram copiados. Não mexa em `checks`.
2. Rode `openspec update`.
3. Rode as verificações da seção 5 do INSTALL.md da NOVA.
4. Apresente a tabela do que foi aplicado, o resultado da verificação, os diffs e o
   `git status`. Sugira o commit "chore: atualiza o template para v<nova>" e
   **espere aprovação**.

Apague NOVA e INSTALADA. Termine lembrando o humano de reiniciar o agente para carregar
hooks e skills atualizados.
