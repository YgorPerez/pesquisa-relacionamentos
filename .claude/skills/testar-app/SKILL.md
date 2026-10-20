---
name: testar-app
description: Test the Tem estudo? site once, in a headless Chrome against the worktree's own build, after a frontend change. Use to see a changed page work with the real acervo before calling the change done, and to take the before and after screenshots and videos a pull request that changes a screen needs (the "Evidência de tela" check). Not for unit tests, stories (`pnpm test:stories`) or the Playwright suite (`pnpm e2e`).
---

# Testar o site de verdade

Os testes de unidade não desenham nada, as stories mostram uma peça sozinha, e o e2e roda sobre o acervo de fixture. Nenhum mostra a página que você mudou, com o seu código, sobre o acervo de verdade. Esta skill mostra, uma vez por mudança, e deixa as capturas que o PR pede.

Os comandos estão em [references/recipes.md](references/recipes.md). Leia antes de começar.

## Quem roda, e quando

- O agente principal, uma vez, depois que todas as partes da mudança entraram. Não uma vez por subagente, nem a cada edição.
- Um subagente não sobe o app dele: quem o lançou passa o endereço.
- O navegador roda sem tela. Abra uma janela, ou o Chrome do usuário, só quando ele pedir.

## Onde

No seu worktree, nunca no checkout principal (`AGENTS.md`, "Quatro jeitos de se machucar"). Cada worktree tem as suas portas (`node scripts/ports.ts`).

1. Uma vez por worktree, `node scripts/prepare-worktree.ts` na raiz.
2. `pnpm build`, e então `node scripts/dev.ts start` em segundo plano, guardando o PID. Ele escreve `[dev] up: <url>` quando responde. Depois de um `pnpm e2e`, faça o build de novo: o e2e deixa o build com o acervo de fixture.
3. Deixe o app de pé enquanto o usuário olha ou você itera. Depois, pare aquele PID e nada mais (`docs/agents/ambiente.md`, "Parar").

## O antes e o depois

Um PR que muda tela precisa de pelo menos dois prints e dois vídeos na seção `## Screen` (`docs/agents/evidencia-de-tela.md`). O depois é o seu worktree. O antes é o ramo de destino num segundo worktree, com o build e o `start` dele, nas portas dele. A receita está em [references/recipes.md](references/recipes.md).

## Duas armadilhas

- O `pnpm start` serve o último build. Uma mudança sem `pnpm build` depois dela mostra a página velha.
- `waitForLoadState('networkidle')` às vezes não assenta com a contagem do GoatCounter ligada. Espere as fontes e as imagens, como o `capture.ts` faz.

## O que conferir

Percorra o fluxo que você mudou e capture o estado que o prova. Depois passe por `docs/agents/every-surface.md` no navegador: celular e desktop, com e sem Perfil, sem JS, o link compartilhado. Diga no relatório quais entradas valeram e o que você viu em cada uma.
