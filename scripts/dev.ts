// Sobe o app ou o Storybook deste checkout na porta dele (ADR 0010): as de
// sempre no principal, as do bloco num worktree (`./portas.ts`), então dois
// worktrees sobem lado a lado sem combinar nada.
//
//   node scripts/dev.ts              o `vp dev` (pnpm dev)
//   node scripts/dev.ts start        o servidor do build (pnpm start)
//   node scripts/dev.ts storybook    o Storybook (pnpm storybook)
//   DEV_PORTA=5000 node scripts/dev.ts
//
// `DEV_PORTA`, `START_PORTA` e `STORYBOOK_PORTA` escolhem a porta; o `PORT`
// do shell não, porque outra ferramenta pode tê-lo posto. A porta ocupada é
// erro, e não um pulo calado para a seguinte: pode ser outro worktree no
// mesmo bloco.
//
// Ctrl-C ou `kill <pid deste script>` para o que ele subiu, e só isso: a
// árvore do filho, pelo PID dele (`./matar-arvore.ts`). Outras sessões rodam
// os seus `node` na mesma máquina.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import type { ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { connect } from 'node:net'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { matar, subirComGrupo } from './matar-arvore.ts'
import { ehWorktree, portaPedida, RAIZ, VARIAVEL_DA_PORTA } from './portas.ts'

const USOS_DO_DEV = {
  dev: {
    comando: (porta: number) => `pnpm exec vp dev --port ${porta} --strictPort`,
    env: (): Record<string, string> => ({}),
  },
  start: {
    comando: () => 'node .output/server/index.mjs',
    env: (porta: number) => ({ PORT: String(porta) }),
  },
  storybook: {
    comando: (porta: number) =>
      `pnpm exec storybook dev --port ${porta} --no-open --exact-port`,
    env: (): Record<string, string> => ({}),
  },
} as const

type UsoDoDev = keyof typeof USOS_DO_DEV

/** O que subir para `uso`, na porta do checkout em `raiz` ou na que o
 * ambiente der. Roda em `frontend/`. */
export function comandoDoUso(
  uso: UsoDoDev,
  ambiente: Record<string, string | undefined>,
  raiz = RAIZ,
) {
  const { comando, env } = USOS_DO_DEV[uso]
  const porta = portaPedida(uso, ambiente, raiz)
  return { porta, comando: comando(porta), env: env(porta) }
}

function portaOcupada(numero: number) {
  return new Promise<boolean>((resolver) => {
    const conexao = connect(numero, '127.0.0.1')
    conexao.once('connect', () => {
      conexao.destroy()
      resolver(true)
    })
    conexao.once('error', () => resolver(false))
  })
}

async function esperar(url: string, filho: ChildProcess) {
  while (filho.exitCode === null && filho.signalCode === null) {
    const noAr = await fetch(url).then(
      () => true,
      () => false,
    )
    if (noAr) return true
    await new Promise((pronto) => setTimeout(pronto, 250))
  }
  return false
}

async function subir(uso: UsoDoDev) {
  const dizer = (linha: string) => console.log(`[dev] ${linha}`)
  let plano: ReturnType<typeof comandoDoUso>
  try {
    plano = comandoDoUso(uso, process.env)
  } catch (erro) {
    console.error(`[dev] ${(erro as Error).message}`)
    process.exit(1)
  }
  const { porta, comando, env } = plano
  const frontend = join(RAIZ, 'frontend')
  if (uso === 'start' && !existsSync(join(frontend, '.output/server'))) {
    console.error('[dev] Falta o build: rode `pnpm build` antes.')
    process.exit(1)
  }
  if (await portaOcupada(porta)) {
    const variavel = VARIAVEL_DA_PORTA[uso]
    console.error(
      `[dev] A porta ${porta} já está em uso. Pare o que você subiu nela, ou ` +
        `escolha outra com ${variavel}. Não pare o processo de outra sessão.`,
    )
    process.exit(1)
  }

  const url = `http://localhost:${porta}`
  const origem = ehWorktree() ? `worktree ${RAIZ}` : 'checkout principal'
  dizer(`${uso} ${url} (${origem})`)

  const filho = subirComGrupo(comando, {
    cwd: frontend,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  for (const fluxo of [filho.stdout, filho.stderr])
    if (fluxo)
      createInterface({ input: fluxo }).on('line', (linha) =>
        console.log(`[${uso}] ${linha}`),
      )

  let parando = false
  const parar = (codigo: number) => {
    if (parando) return
    parando = true
    matar(filho)
    process.exit(codigo)
  }
  for (const sinal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const)
    process.on(sinal, () => parar(0))
  // A última rede: saindo por onde for, a árvore do filho vai junto.
  process.on('exit', () => matar(filho))
  filho.on('exit', (codigo, sinal) => {
    if (parando) return
    dizer(`${uso} saiu (${sinal ?? codigo}).`)
    parar(codigo || 1)
  })

  // O `localhost` pode virar ::1 na checagem; o `127.0.0.1` é certo.
  if (await esperar(`http://127.0.0.1:${porta}/`, filho)) dizer(`no ar: ${url}`)
}

if (import.meta.main) {
  const uso = process.argv[2] ?? 'dev'
  if (!(uso in USOS_DO_DEV)) {
    console.error(
      `[dev] Não conheço "${uso}". Use: ${Object.keys(USOS_DO_DEV).join(', ')}.`,
    )
    process.exit(1)
  }
  await subir(uso as UsoDoDev)
}
