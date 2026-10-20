# Rodar implementadores em paralelo

Para o orquestrador que entrega vários tickets de um spec a subagentes ao mesmo tempo. Veio do Festival dos Macacos, onde 9 tickets com uns 10 implementadores rodaram juntos em 15/10/2026.

## Antes de lançar

- Escreva o estado de cada ticket num arquivo antes (`docs/agents/ambiente.md`, "Hábitos de shell"): o que já entrou, as decisões que o próximo precisa saber, o que roda em paralelo. Um implementador começa lendo esse arquivo.
- Lance uns 8 implementadores quando cada um vai rodar a skill `code-review`. A máquina roda no máximo uns 20 agentes juntos, e cada revisão abre mais 2.
- Diga a cada implementador, no prompt, para abrir todo subagente com `run_in_background: false`, os revisores também. Um subagente aberto em segundo plano responde ao orquestrador de cima, e o implementador que o abriu espera um resultado que nunca chega.
- Diga quais pastas são de outro ticket que roda junto, e que ele não mexe nelas.

## Cada implementador

- Trabalha no seu worktree, preparado (`node scripts/prepare-worktree.ts`), num ramo `ticket/<n>-<nome>` tirado da ponta do `origin/spec/<n>-<nome>` (`docs/agents/integracao.md`, "Os ramos").
- Usa as portas do próprio worktree e para só o que subiu (`docs/agents/ambiente.md`). Dois implementadores rodam o e2e juntos sem combinar nada.
- Antes de reportar, faz o merge do ramo do spec, testa de novo e dá push no ramo do ticket. Não abre pull request nem fecha a issue: isso é do orquestrador.

## Ramos que se sobrepõem

Dois ramos que mexem no mesmo parágrafo, ou que acrescentam uma ADR com o mesmo número, conflitam no merge. Faça o merge do ramo que entrou antes no que vem depois, renumere a ADR ali se preciso (o número é o próximo livre em `docs/adr/`), e diga no relatório do ticket que ele contém o outro.
