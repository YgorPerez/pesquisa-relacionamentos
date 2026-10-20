import { describe, expect, it } from 'vite-plus/test'
import { manifestWithoutPreload } from './manifest-without-preload.ts'

const ID = '\0tanstack-start-manifest:v'

/** The module as Start generates it in the server build
 * (`start-manifest-plugin/plugin.js` of `@tanstack/start-plugin-core`). */
const MODULE = `export const tsrStartManifest = () => (${JSON.stringify({
  routes: {
    __root__: {
      preloads: ['/assets/index.js', '/assets/section.js'],
      scripts: [
        { attrs: { type: 'module', async: true, src: '/assets/index.js' } },
      ],
      css: ['/assets/styles.css'],
    },
    '/estudos/$slug': { preloads: ['/assets/_slug.js'] },
  },
})})`

function runTransform(code: string, id = ID) {
  const { transform } = manifestWithoutPreload()
  if (!transform || typeof transform === 'function')
    throw new Error('no filter')
  return (
    transform.handler as (code: string, id: string) => string | undefined
  )(code, id)
}

async function manifestOf(code: string) {
  const url = `data:text/javascript,${encodeURIComponent(code)}`
  const imported = (await import(/* @vite-ignore */ url)) as {
    tsrStartManifest: () => unknown
  }
  return imported.tsrStartManifest()
}

describe('the manifest without preload', () => {
  it('removes the modulepreloads from every route and keeps the script and the CSS', async () => {
    const code = runTransform(MODULE)
    if (!code) throw new Error('the plugin did not touch the manifest')
    expect(await manifestOf(code)).toEqual({
      routes: {
        __root__: {
          scripts: [
            { attrs: { type: 'module', async: true, src: '/assets/index.js' } },
          ],
          css: ['/assets/styles.css'],
        },
        '/estudos/$slug': {},
      },
    })
  })

  it('does not touch another module', () => {
    expect(runTransform(MODULE, '/src/router.tsx')).toBeUndefined()
  })

  // A TanStack that changes the module would silently put the chunks back in
  // the `<head>`, fighting the CSS for bandwidth.
  it('a manifest in another format breaks the build', () => {
    expect(() => runTransform('export default {}')).toThrow(
      /no longer has "export const tsrStartManifest ="/,
    )
  })
})
