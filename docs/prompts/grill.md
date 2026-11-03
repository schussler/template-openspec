# Prompt: entrevista (grill)

Use quando houver decisões de produto em aberto: regras de negócio, limites, casos de
borda. Só o humano pode iniciar: a primeira linha precisa ser `/grill-with-docs`. A skill
conduz a entrevista em rodadas, com uma recomendação em cada pergunta, e grava o
vocabulário em `GLOSSARY.md` e as decisões duráveis em `docs/adr/`.

Responda "sim" para aceitar a recomendação, dê a sua resposta para substituí-la, ou
diga "não sei, deixe como decisão pendente".

---

/grill-with-docs

## OBJETIVO

[O que você quer construir ou mudar. Se veio da investigação, cole os campos dela.]

## FLUXO DESEJADO

[Como deve funcionar, até onde você já sabe.]

## CRITÉRIOS DE ACEITE

[O que você já sabe. Pode ficar incompleto.]

## LIMITES DESTA SESSÃO

- Investigue o código e a documentação para os fatos; pergunte só o que depende de decisão minha.
- Grave apenas `GLOSSARY.md` e `docs/adr/`. Não crie change, spec, código nem tarefa.
- Não use `openspec/changes/archive/` como fonte de comportamento atual.

## ANTES DE ENCERRAR — DOCUMENTAÇÃO

- Confira se os termos gravados no `GLOSSARY.md` são usados com o mesmo sentido em `openspec/specs/`, `README.md` e `docs/`. Liste os lugares que usam um termo com outro sentido ou um sinônimo, sem corrigir as specs.
- Para cada ADR criado, confira se ele contradiz um ADR existente. Se contradiz, o novo deve declarar que substitui o antigo, e o antigo fica como está.
- Liste o que foi criado ou alterado no `GLOSSARY.md` e em `docs/adr/`.

## CONCLUSÃO

Quando não sobrar pergunta aberta e eu confirmar o entendimento, entregue:

1. Os campos OBJETIVO, FLUXO DESEJADO e CRITÉRIOS DE ACEITE preenchidos com as decisões confirmadas.
2. A lista de decisões que ficaram pendentes.
3. O próximo passo: `docs/prompts/sessao.md` (tipo C) ou `docs/prompts/mudanca-pequena.md` (tipo A ou B), com o motivo.

Para seguir na mesma conversa, eu vou responder: "Entendimento confirmado. Siga docs/prompts/sessao.md com esses campos e pule a Etapa 0." Se a sessão for encerrada antes, guarde os campos e as pendências: as decisões menores só existem nesta conversa.
