# Prompt: auditoria de specs e documentação

Use periodicamente (por exemplo, a cada release ou a cada cinco changes arquivadas) ou
quando suspeitar que specs, testes, código e documentação se afastaram. É somente leitura:
procura o que as checagens automáticas não pegam e termina com a lista de correções, cada
uma com o prompt a usar.

---

Audite se as specs, os testes, o código e a documentação deste projeto ainda concordam.

## ESCOPO

[Todas as capabilities, ou só: <nomes>. Desde: <data, tag ou "a última auditoria">.]

## LIMITES

- Não altere arquivos, não crie changes nem tarefas.
- Leia `AGENTS.md`, `GLOSSARY.md`, `docs/adr/` e `openspec/specs/`. Não use
  `openspec/changes/archive/` como fonte de comportamento atual.
- Diferencie fatos de hipóteses e cite arquivo e linha em cada achado.

## O QUE CONFERIR

1. **Cenário × teste.** Rode `node scripts/check-scenario-tests.mjs`. Para cada cenário
   que tem teste, leia o teste e diga se ele verifica o que o GIVEN/WHEN/THEN descreve:
   verifica, verifica em parte ou não verifica. Um teste com o nome certo que verifica
   outra coisa é um achado.
2. **Comportamento sem spec.** Percorra os pontos de entrada do código (rotas, telas,
   comandos, jobs, mensagens de erro) e liste comportamentos observáveis que nenhuma spec
   descreve.
3. **Spec sem código.** Liste requisitos ou cenários cujo comportamento você não encontra
   no código.
4. **Documentação.** Compare `README.md`, `docs/`, `GLOSSARY.md`, os ADRs e os textos de
   interface com o código: valores, nomes, caminhos e passos que mudaram.
5. **Checagens.** Rode `node scripts/gates/implement-gate.mjs` e
   `openspec validate --all --strict` e registre o resultado.

## ANTES DE ENCERRAR — DOCUMENTAÇÃO

Esta sessão não altera arquivos. Liste os documentos e as seções conferidos, e o que ficou
fora do escopo.

## ENTREGA

1. Tabela "Achado | Onde | Evidência | Lado que parece representar a intenção | Tipo
   (A, B ou C) | Prompt", ordenada por gravidade. Quando a intenção estiver indefinida,
   diga isso em vez de escolher um lado.
2. Os campos preenchidos (ALTERAÇÃO e CRITÉRIOS DE ACEITE, ou OBJETIVO, FLUXO DESEJADO e
   CRITÉRIOS DE ACEITE) para os achados sem decisão pendente.
3. As decisões que dependem de mim.
