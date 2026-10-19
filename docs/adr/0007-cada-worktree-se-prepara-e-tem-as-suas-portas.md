# Cada worktree se prepara sozinho e tem as suas portas

Vários agentes trabalham aqui ao mesmo tempo, cada um num worktree, na mesma máquina. Até o #53, um worktree novo nascia sem `node_modules` e sem os arquivos que o git não leva, e cada agente montava isso à mão. Todos usavam as mesmas portas (4310, 4311, 6310), e o `.env.example` mandava trocar o `E2E_PORTA` em cada worktree: quem esquecia via o Playwright recusar a porta, ou testava o servidor de outro worktree. Copiado do [ADR-0038 do Festival dos Macacos](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0038-each-worktree-prepares-itself-and-gets-its-own-ports.md), sem banco e sem API.

## Decisão

- **O `t3.json` roda `node scripts/preparar-worktree.ts` quando o T3 Code cria um worktree.** Fora dele (o worktree de um agente do Claude Code, um `git worktree add`), quem criou roda o mesmo comando. Ele faz o `pnpm install`, liga do principal o que o git não leva (`frontend/.env*`, `fontes/privado/`, a skill do impeccable), sincroniza `.repos/` (ADR 0009) e diz quantos commits o HEAD está atrás do `origin/main`.
- **O `.env` da raiz e o `.env.deploy` nunca são ligados.** Levam o token da Hostinger e o acesso à VPS.
- **Cada worktree tem um bloco de 10 portas** (`scripts/portas.ts`): dev +0, start +1, e2e +2, Storybook +3, Vitest das stories +4. O bloco sai de um sha256 do caminho, um de 800 entre 40100 e 48099. Abaixo de 40100 ficam os blocos do Festival, que roda na mesma máquina. O principal (`.git` é pasta) fica em 4310, 4311, 4312, 6310 e 6311.
- **`pnpm dev`, `pnpm start` e `pnpm storybook` passam por `scripts/dev.ts`**, que recusa a porta ocupada e diz qual variável a troca (`DEV_PORTA`, `START_PORTA`, `STORYBOOK_PORTA`). O `pnpm e2e` lê a porta no `playwright.config.ts` (`E2E_PORTA`), e o `pnpm test:stories` no `vitest.stories.config.ts` (`STORIES_PORTA`).

## Consequências

- O e2e do principal saiu da 4311, que é do `pnpm start`, e foi para a 4312. Os dois agora rodam juntos.
- Num worktree, o app não está na 4310. A porta sai na linha `[dev]`, ou em `node scripts/portas.ts`.
- O `PORT` genérico do shell não muda a porta: outra ferramenta pode tê-lo posto. A imagem do Docker não passa por aqui e segue no `PORT=3000` dela.
- Dois worktrees caem no mesmo bloco 1 vez em 800. Quando acontece, o segundo recusa a porta, e a variável do uso resolve.
