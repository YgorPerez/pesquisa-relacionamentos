// The variables the build reads, validated once when `vite.config.ts` loads
// (ADR 0032): a wrong one stops `vp dev` and `vp build` before any plugin,
// with its name and what was expected.
//
// `VITE_COUNT_ON_LOCALHOST` also goes into the bundle: `vite.config.ts`
// swaps the raw text for the value read here, `1` or `0`, which
// `analytics/counting.ts` reads.
import { resolve } from 'node:path'
import {
  arquivoOpcional,
  lerVariaveis,
  ligada,
  pasta,
} from '../../scripts/variaveis.ts'

const FRONTEND = resolve(import.meta.dirname, '..')

export interface BuildEnvironment {
  /** The library root (`vite/library.ts`, `vite/possible-group.ts`). */
  readonly contentRoot: string
  /** The live sitemap, for the build to check that no path disappeared. */
  readonly previousSitemap: string | undefined
  /** Whether the build also counts visits on localhost (the e2e one). */
  readonly countOnLocalhost: boolean
}

/** Reads the build from `source`. A relative `CONTENT_ROOT` starts from
 * `frontend/`, as `playwright.config.ts` passes it; `SITEMAP_ANTERIOR`, from
 * `cwd`, the folder where the command ran. */
export function readBuildEnvironment(
  source: Record<string, string | undefined>,
  cwd = process.cwd(),
): BuildEnvironment {
  const read = lerVariaveis(
    {
      CONTENT_ROOT: pasta(FRONTEND, '..'),
      SITEMAP_ANTERIOR: arquivoOpcional(cwd),
      VITE_COUNT_ON_LOCALHOST: ligada(false),
    },
    source,
  )
  return {
    contentRoot: read.CONTENT_ROOT,
    previousSitemap: read.SITEMAP_ANTERIOR,
    countOnLocalhost: read.VITE_COUNT_ON_LOCALHOST,
  }
}
