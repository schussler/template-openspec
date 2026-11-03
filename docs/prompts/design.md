# Prompt: implementar um design

Use quando houver um design pronto (artefato, Figma, HTML ou print) de uma tela ou
componente. Implementar um design muda o que o usuário vê, então é tipo B (ajuste numa
tela existente) ou C (tela ou fluxo novo) e passa por uma change. Preencha os campos entre
colchetes e anexe o print.

---

Implemente no projeto o design abaixo.

## DESIGN

- Fonte: [link do design ou caminho do arquivo]
- Recorte: use SÓ [nome do quadro, tela ou arquivo]. Ignore o resto.
- Resultado esperado: o print anexado.
- Design system do projeto: [ex.: DESIGN_SYSTEM.md e a biblioteca de componentes]
- Escala de renderização do app: [ex.: o app desenha a 90%; compare proporção e alinhamento, não pixels]

## COMPORTAMENTO

[O que a tela faz além do visual: estados (vazio, carregando, erro, sucesso), validações,
ações dos botões, o que acontece ao salvar ou cancelar. Escreva "só visual" se não houver.]

## ETAPA 1 — ANÁLISE E CHANGE

1. Leia `AGENTS.md`, o design system do projeto e as specs da área afetada.
2. Classifique a mudança como B ou C, conforme o `AGENTS.md`.
3. Me mostre uma lista curta:
   - o componente do design system que vai usar em cada parte do design;
   - o que vai ficar diferente do design, e por quê;
   - componentes ou variantes que faltam no design system, com a sua proposta para cada um. Não improvise outra coisa no lugar.
4. Crie a change com a skill `openspec-propose`. Os critérios de aceite incluem os visuais (layout, estados, alinhamento em relação ao print) e os de comportamento. A lista acima entra no `design.md` da change.

## PARADA OBRIGATÓRIA — APROVAÇÃO

Apresente a lista, o caminho da change e as decisões pendentes, peça aprovação explícita e aguarde. Quando o design conflitar com uma regra do projeto, me pergunte em vez de decidir sozinho. Silêncio, esclarecimentos ou aprovação de uma decisão isolada não autorizam a implementação.

## ETAPA 2 — IMPLEMENTAÇÃO

- Use os tokens e componentes do projeto. Não copie o CSS do design.
- Implemente o comportamento com a skill `tdd` (estados, validações, ações). O visual é verificado pela comparação de prints, na etapa 3.
- Componente ou variante novo só se tiver sido aprovado na etapa 1.

## ETAPA 3 — COMPARAÇÃO E VERIFICAÇÃO

1. Rode o app, tire um print da tela pronta e compare com o print anexado, considerando a escala de renderização.
2. Liste as diferenças e corrija até ficar igual. As diferenças aprovadas na etapa 1 não contam.
3. Rode `node scripts/gates/implement-gate.mjs` e a skill `review-change` até `VERDICT: APPROVED`.
4. Escreva o `verification.md`, com o print final, a lista de diferenças corrigidas e as diferenças aprovadas como evidência.

## ANTES DE ENCERRAR — DOCUMENTAÇÃO

- Se um componente ou variante foi criado ou alterado, atualize a documentação do design system (uso, props, quando usar).
- Procure, de forma literal, textos, rótulos e nomes de tela que mudaram em `README.md`, `docs/`, `GLOSSARY.md` e nos textos de interface. Corrija as cópias que ficaram incorretas.
- Não edite `openspec/specs/` diretamente: elas são atualizadas pelos delta specs no archive.
- Liste exatamente os documentos e as seções conferidos.

## ENTREGA

1. O que mudou e quais critérios de aceite foram atendidos.
2. O print final e as diferenças que restaram em relação ao design, com o motivo.
3. As verificações executadas e o veredito do `review.md`.
4. A documentação atualizada, ou o que foi buscado e onde.
5. Pendências e decisões que dependem de mim.

Não arquive nem faça commit sem pedir. Termine perguntando se pode arquivar a change.
