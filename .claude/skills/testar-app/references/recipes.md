# Receitas para testar o site

Os caminhos são a partir da raiz do worktree. Rodaram numa worktree em 19/10/2026.

## Subir e parar

```bash
node scripts/portas.ts                     # as portas deste worktree
pnpm build                                 # uns 30 s; leva o acervo de verdade
node scripts/dev.ts start > /tmp/start-<ticket>.log 2>&1 &
echo $! > /tmp/start-<ticket>.pid
```

Espere a linha `[dev] no ar: <url>` com um comando em segundo plano que sai quando ela aparece (`until grep -q 'no ar' /tmp/start-<ticket>.log; do sleep 0.5; done`), não com um `sleep` em primeiro plano. Se a porta estiver ocupada, o `dev.ts` para e diz; escolha outra com `START_PORTA`.

Para parar, o PID que você guardou, e confira a porta:

```bash
kill "$(cat /tmp/start-<ticket>.pid)"
ss -ltnp 'sport = :<porta start>'
```

## Capturar

`frontend/scripts/capture.ts` tira o print no celular (390×844) e no desktop (1280×800), e com `--video` grava do carregamento ao último toque. Por padrão abre o `start` deste worktree:

```bash
cd frontend
node scripts/capture.ts /prioridades --video --out /tmp/capturas-<ticket> --name prioridades-depois
node scripts/capture.ts /onde-conhecer-pessoas/app-ou-bar --tap 'text=Mulher' --video --name guia-depois
node scripts/capture.ts --help
```

- `--tap <seletor>` toca num seletor do Playwright antes da captura; repete na ordem dada.
- `--only mobile` ou `--only desktop` tira só uma das telas; `--full` pega a página inteira.
- O vídeo sai em `.mp4` com o `ffmpeg` do PATH (a máquina tem), e em `.webm` sem ele.
- `--story <id> --at 0,500,1000` fotografa uma story do `pnpm storybook` deste worktree em instantes da animação. Um id errado lista os parecidos.

## O antes

O antes é o ramo de destino, num segundo worktree com as portas dele:

```bash
git worktree add --detach /tmp/antes-<ticket> origin/<ramo de destino>
cd /tmp/antes-<ticket> && node scripts/preparar-worktree.ts && pnpm build
node scripts/portas.ts                     # a porta start do antes
node scripts/dev.ts start > /tmp/antes-<ticket>.log 2>&1 & echo $! > /tmp/antes-<ticket>.pid
cd <seu worktree>/frontend
node scripts/capture.ts /prioridades --video --port <start do antes> --out /tmp/capturas-<ticket> --name prioridades-antes
```

Pare o `start` do antes pelo PID e remova a worktree: `git worktree remove --force /tmp/antes-<ticket>`.

## Anexar no PR

Escreva a seção `## Tela` com os caminhos locais e anexe com `gh pr edit --attach`, da pasta das capturas. A tabela e o comando estão em `docs/agents/evidencia-de-tela.md`, "Anexar". Confira o check depois:

```bash
GH_TOKEN=$(gh auth token --user YgorPerez) node .github/scripts/evidencia-de-tela.ts <pr>
```

## Um script seu

Para o que o `capture.ts` não faz (encher o Perfil, ler o `localStorage`, desligar o JS), um script do Playwright em `/tmp`, rodado de `frontend/` para o `@playwright/test` resolver:

```ts
import { chromium, devices } from '@playwright/test'

const navegador = await chromium.launch({ channel: 'chrome' })
const contexto = await navegador.newContext({
  ...devices['Pixel 7'],
  locale: 'pt-BR',
})
const pagina = await contexto.newPage()
pagina.on('pageerror', (e) => console.error('pageerror', e.message))
await pagina.goto(`http://localhost:<porta start>/prioridades`)
await pagina.evaluate(() => document.fonts.ready)
await pagina.screenshot({ path: '/tmp/prioridades.png' })
await navegador.close()
```

Sem JS: `navegador.newContext({ javaScriptEnabled: false })`. Apague o script quando acabar.
