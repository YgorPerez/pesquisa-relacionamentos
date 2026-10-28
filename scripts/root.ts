// The root of the checkout, apart from `ports.ts` so a script that runs before
// `pnpm install` (`prepare-worktree.ts`, #461) can read it: this file imports
// only `node:` modules. Runs on plain `node`: only erasable syntax.

import { fileURLToPath } from 'node:url'

/** The root of the checkout this file is in, without the trailing slash. */
export const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(
  /[\\/]+$/,
  '',
)
