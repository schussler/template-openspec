---
name: review-change
description: Revisa uma change do OpenSpec depois que as tarefas de implementação do /opsx:apply terminam e antes de escrever o verification.md. Despacha os subagentes code-reviewer e security-reviewer (ECC) em contexto novo, confere cada critério de aceite (CA-n) e a documentação afetada, e grava openspec/changes/<change>/review.md com uma linha VERDICT. Use ao fim do apply, quando o usuário pedir revisão de uma change, ou antes de arquivar.
---

# Revisar uma change do OpenSpec

Você é o coordenador da revisão. Você **não** revisa o código pessoalmente e **não** corrige nada nesta skill: reúne o contexto, despacha os revisores, consolida os achados e registra o veredito.

## 1. Identificar a change

- Se o usuário nomeou a change, use esse nome. Senão, rode `openspec list` e escolha a ativa; se houver mais de uma candidata, pergunte.
- Leia `proposal.md` (em especial "Critérios de aceite" e "Fora do escopo"), `design.md` (em especial "Superfície de segurança" e "Documentação afetada"), `tasks.md` e todos os arquivos em `specs/`.
- Se houver tarefas de implementação não marcadas em `tasks.md`, avise e pergunte se deve revisar mesmo assim.

## 2. Delimitar o diff

- Base: `git merge-base HEAD main` (ou `master`, ou a branch que o usuário indicar).
- Escopo: `git diff <base>` (inclui alterações não commitadas) e `git diff --name-only <base>`.
- Separe o diff em duas partes: **código** (tudo fora de `openspec/` e da documentação) e **documentação** (arquivos listados em "Documentação afetada" e qualquer outro `.md` alterado). Os artefatos em `openspec/changes/` são o contrato, não a entrega.
- Se o diff de código estiver vazio, pare e diga que não há o que revisar.

## 3. Revisão de código (sempre)

Rode `node scripts/check-scenario-tests.mjs --change <change>`. Cada cenário listado como SEM TESTE vira um achado HIGH com origem `check-scenario-tests`.

Despache o subagente `code-reviewer` com um prompt que contenha:

- o comando exato do diff do passo 2 (ele deve rodá-lo, em vez de `git diff --staged`);
- o caminho da pasta `openspec/changes/<change>/`;
- se existir `CODING_STANDARDS.md` na raiz, o caminho dele, com o pedido: **"Aplique também os padrões de `CODING_STANDARDS.md`. Cite a regra violada em cada achado que vier dele."**
- estes pedidos adicionais, além do checklist dele:
  1. **"Para cada critério de aceite (CA-n) da proposta e cada cenário em `specs/`, diga se está implementado e se há teste que o comprove. Marque como HIGH qualquer critério ou cenário sem implementação e como MEDIUM qualquer um sem teste."**
  2. **"Liste como HIGH qualquer comportamento implementado que esteja em 'Fora do escopo' e como MEDIUM qualquer comportamento implementado que não esteja em nenhuma spec."**
  3. **"Confira a documentação nos dois sentidos: cada item de 'Documentação afetada' no design foi atualizado no diff e descreve o comportamento entregue? Algum documento alterado descreve algo que o código não faz? Marque divergências como MEDIUM e cite documento e seção."**
  4. Se existir `GLOSSARY.md`: **"Aponte como LOW nomes de variáveis, funções, arquivos ou mensagens que contradizem os termos do glossário."**

## 4. Revisão de segurança (condicional)

Despache o subagente `security-reviewer`, pedindo que ele use a skill `ecc-security-review`, se **qualquer** condição for verdadeira:

- a "Superfície de segurança" do `design.md` não for "Nenhuma", ou estiver ausente;
- o diff tocar autenticação, autorização, sessões, entrada do usuário, upload, endpoints, consultas ao banco, segredos ou variáveis de ambiente, criptografia, pagamentos ou arquivos de dependências;
- o usuário pedir.

Na dúvida, rode. Passe o mesmo diff e a mesma pasta. Se não rodar, registre o motivo. Os dois revisores podem rodar em paralelo: ambos são somente leitura.

## 5. Consolidar e registrar

Escreva `openspec/changes/<change>/review.md` (em nova rodada, sobrescreva o topo e mova a rodada anterior para o fim):

```markdown
# Revisão: <change>

VERDICT: APPROVED | BLOCKED
Data: <AAAA-MM-DD> · Base: <sha curto> · Rodada: <n>

## Critérios de aceite
| Critério | Requisito / cenário | Implementado | Teste |
|---|---|---|---|

## Documentação
| Documento e seção | Atualizado | Coerente com o código | Observação |
|---|---|---|---|

## Achados
| Severidade | Origem | Arquivo:linha | Problema | Status |
|---|---|---|---|---|
<!-- Origem: code-reviewer | security-reviewer. Status: aberto | corrigido | aceito pelo humano (motivo) -->

## Segurança
<executada ou motivo para não executar; resumo>

## Rodadas anteriores
```

Regras do veredito:

- **BLOCKED** se houver qualquer achado CRITICAL ou HIGH com status "aberto".
- **APPROVED** caso contrário. MEDIUM/LOW abertos ficam listados e entram em "pendências" no `verification.md`.
- Só o humano muda um achado para "aceito pelo humano". Nunca faça isso por conta própria.
- Não invente achados nem rebaixe severidades. Copie a severidade atribuída pelo revisor.

## 6. Reportar

Mostre o veredito e os achados abertos.

- BLOCKED → proponha as correções e pergunte se pode aplicá-las. Depois, rode esta skill de novo (nova rodada), despachando só o revisor afetado, a menos que o diff tenha mudado muito.
- APPROVED → o próximo passo é escrever o `verification.md`, usando as tabelas deste `review.md` como parte da evidência.
