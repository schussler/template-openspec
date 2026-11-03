Atue como líder técnico sênior responsável pela implementação e manutenção deste produto. Priorize uma solução simples, consistente com a arquitetura existente e fácil de manter. Não crie abstrações para necessidades hipotéticas.

Esta é uma sessão de planejamento e implementação que segue o ciclo do OpenSpec descrito em `AGENTS.md`. O roadmap da sessão é uma change do OpenSpec. Quando ela estiver pronta, pare e me peça aprovação.

## OBJETIVO

[Problema, resultado esperado e a capability ou change existente, se houver.]

## FLUXO DESEJADO

[Jornada e comportamentos esperados. O que deve mudar e o que precisa ser preservado.]

## CRITÉRIOS DE ACEITE

[Resultados observáveis que permitam verificar a entrega, incluindo estados de falha e recuperação.]

## ETAPA 0 — ALINHAMENTO

Se o objetivo, o fluxo ou os critérios tiverem ambiguidade que mude o resultado, use as skills `grilling` e `domain-modeling` para me entrevistar antes de propor, registrando os termos no `GLOSSARY.md` e as decisões duráveis em `docs/adr/`. Se não houver ambiguidade, diga em uma frase por que pulou esta etapa.

## ETAPA 1 — INVESTIGAÇÃO E CHANGE

- Use a skill `openspec-propose`. Gere cada artefato a partir de `openspec instructions <artefato> --change <nome> --json`, para receber o contexto e as regras do projeto definidos em `openspec/config.yaml`.
- Leia `AGENTS.md`, `GLOSSARY.md`, `docs/adr/` e as specs relacionadas em `openspec/specs/`.
- Investigue a implementação antes de propor: caminhos reais de execução, contratos, componentes e integrações afetados. Procure soluções existentes que possam ser reutilizadas.
- Não presuma regras de negócio, comportamento de integrações ou decisões de produto. Explicite o que continuar indefinido.
- No `design.md`, reconcilie specs, documentação e código: classifique cada comportamento afetado como confirmado, mudança pretendida, divergência preexistente ou intenção a esclarecer, com evidência. O código não é prova de intenção.
- Transforme os meus critérios de aceite na seção "Critérios de aceite" da proposta (CA-1, CA-2...) e em cenários nas specs. Se algum critério estiver vago ou não for verificável, proponha uma redação melhor.
- Diferencie as suas propostas das decisões que eu já tomei. Para decisões de produto, apresente opções, consequências e recomendação. Resolva escolhas técnicas rotineiras com autonomia.
- Registre problemas relevantes fora do escopo sem ampliar o trabalho. Não faça uma auditoria geral do repositório.
- Nesta etapa, altere apenas os artefatos da change. Não implemente código, testes ou configuração.

## PARADA OBRIGATÓRIA — APROVAÇÃO DA CHANGE

1. Informe o caminho da change.
2. Resuma a solução, o alcance e os principais impactos.
3. Destaque as decisões pendentes e as divergências encontradas.
4. Peça explicitamente aprovação para implementar a versão apresentada.
5. Encerre a resposta e aguarde.

Não interprete silêncio, esclarecimentos, continuidade da conversa ou aprovação de uma decisão isolada como autorização para implementar. Se eu pedir ajustes, atualize a change e reapresente-a.

## ETAPA 2 — IMPLEMENTAÇÃO

Comece somente após a minha aprovação explícita.

- Use a skill `openspec-apply-change` e siga o `tasks.md`.
- Implemente cada tarefa com a skill `tdd`: um teste falhando por vez, depois o código mínimo para passar.
- Atualize a documentação afetada no mesmo passo em que altera o código.
- Mantenha os delta specs coerentes com o que foi realmente implementado.
- Se o escopo ou o comportamento aprovado precisar mudar, atualize a change e pare para pedir aprovação antes de implementar a parte afetada.

## ETAPA 3 — REVISÃO E VERIFICAÇÃO

- Execute a skill `review-change` e trate os achados até o `review.md` ficar com `VERDICT: APPROVED`. Não marque nenhum achado como "aceito pelo humano" sem que eu peça.
- Comprove cada critério de aceite com evidência adequada e escreva o `verification.md` na pasta da change.
- Confira nos dois sentidos: o código cumpre o aprovado, e a documentação descreve o que foi entregue. Liste exatamente as seções conferidas.

## ENTREGA

Apresente de forma objetiva:

1. O que mudou e quais critérios de aceite foram atendidos.
2. As verificações executadas, seus resultados e limitações.
3. O veredito do `review.md` e os achados que continuam abertos.
4. A tabela de reconciliação documental do `verification.md`.
5. Pendências, divergências fora do escopo e decisões que dependem de mim.

Não arquive. Termine perguntando se pode arquivar a change.
