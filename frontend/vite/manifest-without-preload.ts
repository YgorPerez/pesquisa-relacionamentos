// Removes the `modulepreload`s from the TanStack Start manifest (#59, ADR
// 0034), modeled on the Festival dos Macacos `manifesto-sem-preload.ts`.
// Start puts in the `<head>` a `modulepreload` for each chunk the route
// imports, ten on the home page, requested at the same moment as the CSS and
// the fonts. On slow 4G they share the bandwidth with what paints the first
// screen. Without them, the browser requests the CSS, the fonts and the
// entry (the `<script>` in the `<head>`), and finds the rest of the JS by
// reading the entry.
//
// The cut is in the manifest, and not in the HTML: the server draws the
// `<head>` with it and sends the same manifest to the browser, which draws
// the `<head>` again on hydration. Removing the tags only from the HTML would
// make the two diverge.

import type { Plugin } from 'vite'

/** The id of the manifest's virtual module, in
 * `@tanstack/start-server-core`. */
const MANIFEST = '\0tanstack-start-manifest:v'
const EXPORT = 'export const tsrStartManifest ='

export function manifestWithoutPreload(): Plugin {
  return {
    name: 'manifest-without-preload',
    enforce: 'post',
    applyToEnvironment: (environment) => environment.name === 'ssr',
    transform: {
      filter: { id: /^\0tanstack-start-manifest:v$/ },
      handler(code, id) {
        if (id !== MANIFEST) return
        // A new TanStack that generates the module another way stops the
        // build here, and does not silently put the chunks back in the
        // `<head>`.
        if (!code.includes(EXPORT))
          throw new Error(
            `manifest-without-preload: the Start manifest no longer has "${EXPORT}". Check the ${MANIFEST} module.`,
          )
        return `${code.replace(EXPORT, 'const fullManifest =')}
export const tsrStartManifest = () => {
  const manifest = fullManifest()
  for (const route of Object.values(manifest.routes)) delete route.preloads
  return manifest
}`
      },
    },
  }
}
