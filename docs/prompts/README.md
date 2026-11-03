# Prompts

Cada prompt cobre um tipo de trabalho. Todos terminam conferindo e atualizando a
documentação afetada antes de encerrar.

| Prompt | Quando usar | Altera arquivos? |
|---|---|---|
| [investigacao.md](investigacao.md) | Dúvida, ideia vaga, bug estranho, ou não sabe o tamanho da mudança | Não |
| [grill.md](grill.md) | Decisões de produto em aberto (só você inicia, com `/grill-with-docs`) | Só `GLOSSARY.md` e `docs/adr/` |
| [mudanca-pequena.md](mudanca-pequena.md) | Ajuste localizado: tipo A (sem change) ou B (change curta) | Sim |
| [sessao.md](sessao.md) | Capacidade nova ou mudança relevante: tipo C | Sim |
| [design.md](design.md) | Tela ou componente com design pronto | Sim |
| [stack.md](stack.md) | Primeira change do projeto: define a stack e liga as checagens | Sim |
| [auditoria.md](auditoria.md) | Revisão periódica: specs, testes, código e docs ainda concordam? | Não |

## Como escolher

```
Projeto novo, template.json → checks.test é null? → stack.md
Não sabe o tamanho ou o que fazer?        → investigacao.md
Há decisões de produto em aberto?         → grill.md
Alguém de fora perceberia a diferença?
  não                                      → mudanca-pequena.md (tipo A)
  sim, ajuste localizado                   → mudanca-pequena.md (tipo B)
  sim, algo novo ou relevante              → sessao.md (tipo C)
Tem um design pronto de uma tela?          → design.md
```

Na dúvida, comece pela investigação: ela não altera nada e indica o próximo prompt, com
os campos preenchidos.

## Sequências comuns

- **Feature nova:** investigação → grill → sessão.
- **Ajuste pequeno:** mudança pequena.
- **Bug:** investigação (com `diagnosing-bugs`) → mudança pequena.
- **Tela nova:** grill (se houver regras de negócio) → design.
- **Início do projeto:** grill (se a stack estiver em aberto) → stack.
- **Manutenção:** auditoria a cada release ou a cada cinco changes arquivadas → um prompt
  por achado.
