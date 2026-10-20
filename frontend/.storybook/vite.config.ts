import { resolve } from 'node:path'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'
import { library } from '../vite/library.ts'
import { possibleGroup } from '../vite/possible-group.ts'

/** The stories' content: the e2e fixture, with a Fact sheet of each Status
 * and the data for Acre. The story always shows the same, and so does its
 * test. */
const CONTENT = resolve(import.meta.dirname, '..', 'e2e', 'library')

export default defineConfig({
  resolve: { tsconfigPaths: true },
  // On the site, the Guide view is only built on the server; here the story
  // builds it in the browser, and its `xss` is CommonJS: Vite bundles it
  // first, or the named import fails.
  optimizeDeps: { include: ['xss'] },
  plugins: [
    tailwindcss(),
    viteReact(),
    // The React Compiler too, so the story renders as the site renders
    // (ADR 0003).
    babel({ presets: [reactCompilerPreset()] }),
    // The library and the Possible group packs, as in the app: a Guide
    // piece's story builds the view of a fixture Guide, and the Possible
    // group card's story downloads the packs the plugin serves.
    library({ root: CONTENT, previousSitemap: undefined }),
    possibleGroup({ root: CONTENT }),
  ],
})
