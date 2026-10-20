# A suíte inteira roda toda noite, no Actions

O CI de um PR prova o diff dele contra a base daquele momento. Dois PRs que entram no mesmo dia podem quebrar juntos o que nenhum quebrou sozinho, e a `main` não roda nada depois do merge. Do `nightly-suite.ts` do Festival dos Macacos, que roda numa worktree da máquina pelo Agendador de Tarefas do Windows.

## Decisão

- **O `nightly-suite.yml` roda às 04:00 de Brasília** (e com `workflow_dispatch`), chamando o `pr.yml` como workflow reutilizável: os mesmos jobs, na `main`.
- **O último job avisa** (`scripts/nightly-suite.ts`): a primeira noite vermelha abre a issue "Suíte noturna vermelha", com o SHA, os jobs que não passaram, o link da rodada e o fim do log; a seguinte comenta nela; a primeira verde a fecha.

## Opções consideradas

**Na máquina, como no Festival.** Lá o Actions estava desligado por falta de pagamento. Este repositório é público, o Actions roda de graça, e a máquina fica para os agentes.

## Consequências

- O agendamento só roda o arquivo que está na `main`: a suíte noturna começa quando o spec #23 entrar nela.
