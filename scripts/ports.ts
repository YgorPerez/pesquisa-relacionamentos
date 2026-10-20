// The ports of each checkout (ADR 0010, from ADR-0038 of Festival dos Macacos).
// The main checkout keeps the usual ones; each worktree gets a block of its
// own, taken from a hash of its own path, so several agents bring up dev,
// start, e2e and Storybook at the same time on the same machine without
// coordinating. The same path always gives the same block.
//
// Readers: `scripts/dev.ts` (dev, start and Storybook),
// `frontend/playwright.config.ts` (e2e) and `frontend/vitest.stories.config.ts`
// (the Vitest browser server), all through `requestedPort`. A port given in the
// environment beats the derived one, and one that is not a port stops
// everything. CI runs in a normal checkout, and uses the main checkout's ports.
// The Docker image does not go through here.
//
//   node scripts/ports.ts        prints this checkout's ports
//
// Runs on plain `node`, which reads TypeScript by itself: only erasable syntax.

import { createHash } from 'node:crypto'
import { statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { port, readEnv } from './env.ts'

/** The main checkout's ports. `vite dev` on 4310, the build server
 * (`pnpm start`) on 4311, the e2e one on 4312, Storybook on 6310 and the
 * stories' Vitest on 6311: away from the Festival's (3000–3029) and from the
 * ones people open by hand (5173, 6006, 8080). */
const MAIN_CHECKOUT_PORTS = {
  dev: 4310,
  start: 4311,
  e2e: 4312,
  storybook: 6310,
  stories: 6311,
} as const

export type PortUse = keyof typeof MAIN_CHECKOUT_PORTS
export const PORT_USES = Object.keys(MAIN_CHECKOUT_PORTS) as PortUse[]

/** Ten ports per block, and the use in the order of `MAIN_CHECKOUT_PORTS`: dev
 * at +0, start at +1, e2e at +2, Storybook at +3, stories at +4. Five are left
 * for a new use. */
const BLOCK_WIDTH = 10

/** Blocks start at 40100 and go up to 48099: 800 blocks. Below, from 10100 to
 * 40099, are the blocks of the Festival's worktrees, which run on the same
 * machine. Above 49152 Windows hands out ephemeral ports. Two worktrees land
 * in the same block 1 time in 800; when that happens, `dev.ts` and Playwright
 * refuse the busy port, and the use's variable picks another. */
const FIRST_WORKTREE_PORT = 40_100
const BLOCKS = 800

/** The root of the checkout this file is in, without the trailing slash. */
export const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(
  /[\\/]+$/,
  '',
)

/** In a worktree (`git worktree add`), `.git` is a file pointing to the main
 * repository; in the main checkout it is the folder. No `.git` at all (a loose
 * copy) counts as main. */
export function isWorktree(root = ROOT) {
  try {
    return statSync(`${root}/.git`).isFile()
  } catch {
    return false
  }
}

/** `C:\a\b\` and `c:/a/b` are the same folder on Windows. */
function normalize(path: string) {
  const slashed = path.replaceAll('\\', '/').replace(/\/+$/, '')
  return /^[a-z]:\//i.test(slashed) ? slashed.toLowerCase() : slashed
}

/** The block of the worktree at `path`, from 0 to 799. */
export function worktreeBlock(path: string) {
  const hash = createHash('sha256').update(normalize(path)).digest()
  return hash.readUInt32BE(0) % BLOCKS
}

/** The port for `use` in the checkout at `root`. */
export function checkoutPort(use: PortUse, root = ROOT) {
  if (!isWorktree(root)) return MAIN_CHECKOUT_PORTS[use]
  return (
    FIRST_WORKTREE_PORT +
    worktreeBlock(root) * BLOCK_WIDTH +
    PORT_USES.indexOf(use)
  )
}

/** The variable that picks the port of each use. */
export const PORT_VARIABLE = {
  dev: 'DEV_PORT',
  start: 'START_PORT',
  e2e: 'E2E_PORT',
  storybook: 'STORYBOOK_PORT',
  stories: 'STORIES_PORT',
} as const satisfies Record<PortUse, string>

/** The port for `use`: the one from its variable in `environment`, validated
 * (`./env.ts`), or the checkout's at `root`. */
export function requestedPort(
  use: PortUse,
  environment: Record<string, string | undefined> = process.env,
  root = ROOT,
) {
  const name = PORT_VARIABLE[use]
  return readEnv({ [name]: port(checkoutPort(use, root)) }, environment)[name]!
}

if (import.meta.main) {
  const where = isWorktree() ? `worktree ${ROOT}` : 'main checkout'
  console.log(`[ports] ${where}`)
  for (const use of PORT_USES) console.log(`${use}\t${checkoutPort(use)}`)
}
