import { fileURLToPath } from 'node:url'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv, type PluginOption } from 'vite-plus'
import { vitestWorkers } from '../scripts/machine-queue.ts'
import { library } from './vite/library.ts'
import { readBuildEnvironment } from './vite/environment.ts'
import { possibleGroup } from './vite/possible-group.ts'
import { manifestWithoutPreload } from './vite/manifest-without-preload.ts'

// The run joins the machine queue before starting and takes the workers it
// is given (`scripts/machine-queue.ts`, ADR 0013).
const workers = await vitestWorkers()

/** The e2e fixture content, which the screen tests read. */
const FIXTURE = fileURLToPath(new URL('e2e/library', import.meta.url))

// Vitest only needs React: Start and nitro build the server, which no Vitest
// test uses. The screen tests build the router in jsdom (ADR 0035), and the
// whole app, with the server, is tested by Playwright over the build
// (`playwright.config.ts`).
const appPlugins = (mode: string): PluginOption[] => {
  // The build variables, validated before any plugin (`vite/environment.ts`,
  // ADR 0032). `loadEnv` merges this package's `.env` into the shell
  // environment, which wins; the empty prefix also brings the ones without
  // `VITE_`.
  const environment = readBuildEnvironment(
    loadEnv(mode, import.meta.dirname, ''),
  )
  return [
    // The bundle gets the already validated value, and not the raw
    // environment text.
    {
      name: 'count-on-localhost',
      config: () => ({
        define: {
          'import.meta.env.VITE_COUNT_ON_LOCALHOST': JSON.stringify(
            environment.countOnLocalhost ? '1' : '0',
          ),
        },
      }),
    },
    library({
      root: environment.contentRoot,
      previousSitemap: environment.previousSitemap,
    }),
    possibleGroup({ root: environment.contentRoot }),
    // The Tailwind classes (`styles.css`, `ui/tokens.css`), before Start, as
    // in the Festival.
    tailwindcss(),
    tanstackStart(),
    // Without the `modulepreload` of each chunk in the `<head>` (ADR 0034).
    manifestWithoutPreload(),
    nitro(),
    viteReact(),
    // The React Compiler memoizes every component and hook in the build.
    // React's plugin 6 no longer brings Babel, and the compiler is still a
    // Babel plugin: it runs through `@rolldown/plugin-babel`, only in the
    // browser bundle (the preset skips SSR). A screen the compiler breaks
    // leaves it with `'use no memo'` at the top (ADR 0003).
    babel({ presets: [reactCompilerPreset()] }),
  ]
}

export default defineConfig(({ mode }) => ({
  resolve: { tsconfigPaths: true },
  plugins: process.env.VITEST ? [viteReact()] : appPlugins(mode),
  test: {
    ...(workers ? { maxWorkers: workers } : {}),
    projects: [
      {
        extends: true,
        test: {
          name: 'logic',
          include: [
            'src/**/*.test.ts',
            'nginx/**/*.test.ts',
            'scripts/**/*.test.ts',
            'vite/**/*.test.ts',
            'lint/**/*.test.ts',
          ],
          environment: 'node',
        },
      },
      {
        // The screens in jsdom, with Testing Library (ADR 0035): the real
        // router, over the e2e fixture library and data (`e2e/library`). The
        // server functions run inside the test itself
        // (`src/platform/screens/test-server.ts`), and the Possible group
        // packs arrive through MSW (`src/platform/screens/network.ts`).
        extends: true,
        plugins: [
          library({ root: FIXTURE, previousSitemap: undefined }),
          possibleGroup({ root: FIXTURE }),
        ],
        resolve: {
          alias: [
            {
              find: /^@tanstack\/react-start$/,
              replacement: fileURLToPath(
                new URL('src/platform/screens/test-server.ts', import.meta.url),
              ),
            },
            {
              find: /^@tanstack\/react-start\/server$/,
              replacement: fileURLToPath(
                new URL(
                  'src/platform/screens/test-request.ts',
                  import.meta.url,
                ),
              ),
            },
          ],
        },
        test: {
          name: 'screens',
          include: ['src/**/*.test.tsx'],
          // The stories run in a Chrome (`vitest.stories.config.ts`).
          exclude: ['src/**/*.browser.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./src/platform/screens/setup.ts'],
          // On localhost, the count does not go out (`analytics/counting.ts`).
          environmentOptions: { jsdom: { url: 'http://localhost/' } },
          // A file's first screen compiles the routes inside the test.
          testTimeout: 30_000,
        },
      },
    ],
    // The coverage serves `fallow health` (the `json` format) and has a floor
    // (ADR 0005): the measured value, rounded down, which rises with it and
    // never falls. It counts the logic and the screen tests (`screens`); the
    // e2e and the stories stay out.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json'],
      include: ['{src,vite,nginx,scripts,lint}/**/*.{ts,tsx}'],
      thresholds: { statements: 61, branches: 65, functions: 63, lines: 62 },
    },
  },
}))
