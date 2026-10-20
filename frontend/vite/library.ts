// The library enters the app through the virtual module `virtual:library`,
// built by the content package. Content with an error breaks the build, with
// the whole list of problems. Only the server imports the module (the
// functions in `src/content/` and `src/server.ts`), so the Fact sheets' text
// does not go into the browser bundle.
//
// In the browser build, the plugin writes `sitemap.xml` and `robots.txt` at
// the root of what goes into the server's `public`.
//
// `CONTENT_ROOT` swaps the repository root: the e2e builds over the fixture
// folder `e2e/library`. `SITEMAP_ANTERIOR` is the path of the live
// `sitemap.xml`, which CI and the deploy download from temestudo.cloud before
// the build: with it, the build fails if a published path disappeared without
// `antes`. Both arrive here validated by `vite/environment.ts`.
import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import {
  loadLibrary,
  formatProblems,
  readFiles,
  type Library,
} from '@tem-estudo/content'
import { robotsTxt, sitemapXml } from '@tem-estudo/content/search'
import type { Plugin } from 'vite-plus'

const ID = 'virtual:library'
const RESOLVED = `\0${ID}`

/** `raiz` and `anterior` arrive already validated (`vite/environment.ts`). */
export function library({
  root,
  previousSitemap,
}: {
  root: string
  previousSitemap: string | undefined
}): Plugin {
  let built: Library | null = null

  const load = (
    warn: (message: string) => void,
    fail: (message: string) => never,
  ): Library => {
    const result = loadLibrary(
      root,
      previousSitemap
        ? { previousSitemap: readFileSync(previousSitemap, 'utf8') }
        : {},
    )
    for (const warning of result.warnings) warn(warning.message)
    if (!result.ok) {
      fail(
        `The content in ${relative(process.cwd(), root) || '.'} has ${result.errors.length} error(s):\n${formatProblems(result.errors)}`,
      )
    }
    return result.library
  }

  return {
    name: 'tem-estudo:library',
    resolveId(id) {
      return id === ID ? RESOLVED : undefined
    },
    load(id) {
      if (id !== RESOLVED) return undefined
      for (const file of readFiles(root))
        this.addWatchFile(resolve(root, file.path))
      built = load(
        (m) => this.warn(m),
        (m) => this.error(m),
      )
      return `export default ${JSON.stringify(built)}`
    },
    generateBundle() {
      if (this.environment.name !== 'client') return
      built ??= load(
        (m) => this.warn(m),
        (m) => this.error(m),
      )
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemapXml(built),
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robotsTxt(),
      })
    },
  }
}
