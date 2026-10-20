import { describe, expect, it } from 'vite-plus/test'
import { manifestoSemPreload } from './manifesto-sem-preload.ts'

const ID = '\0tanstack-start-manifest:v'

/** O módulo como o Start o gera no build do servidor
 * (`start-manifest-plugin/plugin.js` do `@tanstack/start-plugin-core`). */
const MODULO = `export const tsrStartManifest = () => (${JSON.stringify({
  routes: {
    __root__: {
      preloads: ['/assets/index.js', '/assets/secao.js'],
      scripts: [
        { attrs: { type: 'module', async: true, src: '/assets/index.js' } },
      ],
      css: ['/assets/styles.css'],
    },
    '/estudos/$slug': { preloads: ['/assets/_slug.js'] },
  },
})})`

function transformar(codigo: string, id = ID) {
  const { transform } = manifestoSemPreload()
  if (!transform || typeof transform === 'function')
    throw new Error('sem filtro')
  return (
    transform.handler as (codigo: string, id: string) => string | undefined
  )(codigo, id)
}

async function manifestoDe(codigo: string) {
  const url = `data:text/javascript,${encodeURIComponent(codigo)}`
  const modulo = (await import(/* @vite-ignore */ url)) as {
    tsrStartManifest: () => unknown
  }
  return modulo.tsrStartManifest()
}

describe('o manifesto sem preload', () => {
  it('tira os modulepreload de toda rota e deixa o script e o CSS', async () => {
    const codigo = transformar(MODULO)
    if (!codigo) throw new Error('o plugin não mexeu no manifesto')
    expect(await manifestoDe(codigo)).toEqual({
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

  it('não mexe em outro módulo', () => {
    expect(transformar(MODULO, '/src/router.tsx')).toBeUndefined()
  })

  // Um TanStack que mude o módulo voltaria a pôr os chunks no `<head>`
  // calado, disputando a banda com o CSS.
  it('um manifesto de outro formato derruba o build', () => {
    expect(() => transformar('export default {}')).toThrow(
      /não tem mais "export const tsrStartManifest ="/,
    )
  })
})
