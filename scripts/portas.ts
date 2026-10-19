// As portas de cada checkout (ADR 0010, do ADR-0038 do Festival dos Macacos).
// O principal fica nas de sempre; cada worktree ganha um bloco só dele, tirado
// de um hash do próprio caminho, e com isso vários agentes sobem o dev, o
// start, o e2e e o Storybook ao mesmo tempo na mesma máquina sem combinar
// nada. O mesmo caminho dá sempre o mesmo bloco.
//
// Quem lê: `scripts/dev.ts` (dev, start e Storybook), o
// `frontend/playwright.config.ts` (e2e) e o `frontend/vitest.stories.config.ts`
// (o servidor do Vitest no navegador). Uma porta dada no ambiente vale mais
// que a derivada; isto só decide o padrão. O CI roda num checkout normal, e
// fica nas do principal. A imagem do Docker não passa por aqui.
//
//   node scripts/portas.ts        imprime as portas deste checkout
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { createHash } from 'node:crypto'
import { statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** As portas do checkout principal. O `vite dev` na 4310, o servidor do build
 * (`pnpm start`) na 4311, o do e2e na 4312, o Storybook na 6310 e o Vitest
 * das stories na 6311: longe das do Festival (3000–3029) e das que alguém
 * abre na mão (5173, 6006, 8080). */
const DO_PRINCIPAL = {
  dev: 4310,
  start: 4311,
  e2e: 4312,
  storybook: 6310,
  stories: 6311,
} as const

export type Uso = keyof typeof DO_PRINCIPAL
export const USOS = Object.keys(DO_PRINCIPAL) as Uso[]

/** Dez portas por bloco, e o uso pela ordem de `DO_PRINCIPAL`: o dev na +0, o
 * start na +1, o e2e na +2, o Storybook na +3, as stories na +4. Sobram cinco
 * para um uso novo. */
const LARGURA_DO_BLOCO = 10

/** Os blocos começam na 40100 e vão até a 48099: 800 blocos. Abaixo, de 10100
 * a 40099, ficam os blocos dos worktrees do Festival, que rodam na mesma
 * máquina. Acima de 49152 o Windows sorteia portas efêmeras. Dois worktrees
 * caem no mesmo bloco 1 vez em 800; quando acontece, o `dev.ts` e o
 * Playwright recusam a porta ocupada, e a variável do uso escolhe outra. */
const PRIMEIRA_DOS_WORKTREES = 40_100
const BLOCOS = 800

/** A raiz do checkout onde este arquivo está, sem a barra do fim. */
export const RAIZ = fileURLToPath(new URL('..', import.meta.url)).replace(
  /[\\/]+$/,
  '',
)

/** Num worktree (`git worktree add`), o `.git` é um arquivo que aponta para o
 * repositório principal; no principal é a pasta. Sem `.git` nenhum (uma cópia
 * solta) conta como principal. */
export function ehWorktree(raiz = RAIZ) {
  try {
    return statSync(`${raiz}/.git`).isFile()
  } catch {
    return false
  }
}

/** `C:\a\b\` e `c:/a/b` são a mesma pasta no Windows. */
function normalizar(caminho: string) {
  const comBarras = caminho.replaceAll('\\', '/').replace(/\/+$/, '')
  return /^[a-z]:\//i.test(comBarras) ? comBarras.toLowerCase() : comBarras
}

/** O bloco do worktree em `caminho`, de 0 a 799. */
export function blocoDoWorktree(caminho: string) {
  const hash = createHash('sha256').update(normalizar(caminho)).digest()
  return hash.readUInt32BE(0) % BLOCOS
}

/** A porta de `uso` no checkout em `raiz`. */
export function portaDoCheckout(uso: Uso, raiz = RAIZ) {
  if (!ehWorktree(raiz)) return DO_PRINCIPAL[uso]
  return (
    PRIMEIRA_DOS_WORKTREES +
    blocoDoWorktree(raiz) * LARGURA_DO_BLOCO +
    USOS.indexOf(uso)
  )
}

if (import.meta.main) {
  const onde = ehWorktree() ? `worktree ${RAIZ}` : 'checkout principal'
  // oxlint-disable-next-line no-console -- teste do teto de supressões (#57)
  console.log(`[portas] ${onde}`)
  for (const uso of USOS) console.log(`${uso}\t${portaDoCheckout(uso)}`)
}
