# Prompt: mudança pequena (tipos A e B)

Use para um ajuste localizado. O agente classifica antes de começar: tipo A (ninguém de
fora percebe) vai direto, sem change; tipo B (muda um comportamento existente) vira uma
change curta. Se for tipo C, ele para e recomenda `sessao.md`.

---

Antes de implementar qualquer alteração, faça a análise inicial e responda apresentando:

1. O seu entendimento da demanda.
2. A classificação, conforme "Antes de alterar código: classifique" no `AGENTS.md`:
   - **A**: não muda comportamento (texto interno, typo, refatoração, dependência, lint). Sem change.
   - **B**: muda um comportamento existente, de forma localizada. Change curta do OpenSpec, com proposal e design de poucas linhas.
   - **C**: capacidade nova ou mudança relevante. Pare e recomende `docs/prompts/sessao.md`.
3. A sugestão de CRITÉRIOS DE ACEITE (resultados observáveis que caracterizam a conclusão).
4. O fluxo de entrega: passos que serão executados e arquivos ou componentes que planeja alterar.

Aguarde a minha aprovação antes de escrever ou alterar código. Depois da aprovação, implemente com a menor mudança suficiente, seguindo as regras e os padrões existentes do projeto. Evite refatorações fora do escopo e abstrações desnecessárias.

## ALTERAÇÃO

[Descreva o problema e o resultado esperado.]

## CRITÉRIOS DE ACEITE

[Liste os resultados observáveis que caracterizam a conclusão.]

## EXECUÇÃO

- Investigue o código relacionado antes de alterar e reutilize as soluções existentes.
- Correção de bug em que a spec já descreve o comportamento certo: tipo A, com um teste nomeado `<capability> / <cenário>` que reproduz o bug antes da correção. Se o certo for o código e não a spec, é tipo B. Na dúvida sobre qual lado está certo, pergunte.
- No tipo B: crie a change com a skill `openspec-propose` (use MODIFIED na capability existente; não crie capability nova sem necessidade), pare para aprovação, implemente com a skill `tdd` e rode a `review-change` até `VERDICT: APPROVED`. Depois escreva o `verification.md`.
- Rode `node scripts/gates/implement-gate.mjs` e resolva o que falhar.
- Prossiga com escolhas técnicas rotineiras. Se descobrir uma decisão de produto pendente, mudança arquitetural ou ampliação relevante do escopo, apresente o motivo e aguarde orientação antes de prosseguir com a parte afetada. Se a mudança se revelar tipo C, pare e recomende `sessao.md`.

## ANTES DE ENCERRAR — DOCUMENTAÇÃO

- Confira a documentação do comportamento afetado e atualize as seções que a mudança tornou incorretas, preservando a fonte canônica.
- Procure o valor, texto, nome ou caminho antigo, de forma literal, em `README.md`, `docs/`, `AGENTS.md`, `CLAUDE.md`, `GLOSSARY.md` e nos textos de interface, não só na spec. Corrija as cópias que ficaram incorretas.
- Não edite `openspec/specs/` diretamente. No tipo A, a spec não deve precisar mudar; se precisar, a mudança é tipo B, e você deve parar e avisar. No tipo B, a spec é atualizada pelo delta da change, no archive.
- Se nenhum documento precisou mudar, diga o que foi buscado e onde.

## ENTREGA

- O que mudou e a classificação (A ou B).
- Como foi verificado e o resultado. No tipo B, o veredito do `review.md`.
- Qual documentação foi atualizada, ou o que foi buscado e onde, se nada precisou mudar.
- Pendências ou limitações, se houver.
- No tipo B, termine perguntando se pode arquivar a change.
