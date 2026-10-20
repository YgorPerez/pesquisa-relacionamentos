import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import { lerAmbienteDoBuild } from './ambiente.ts'

const FRONTEND = resolve(import.meta.dirname, '..')

const PASTA = mkdtempSync(join(tmpdir(), 'ambiente-'))
afterAll(() => rmSync(PASTA, { recursive: true, force: true }))
writeFileSync(join(PASTA, 'sitemap.xml'), '<urlset/>')
mkdirSync(join(PASTA, 'acervo'))

describe('lerAmbienteDoBuild', () => {
  it('sem nada, o acervo da raiz do repositório, sem sitemap e sem contar em localhost', () => {
    expect(lerAmbienteDoBuild({})).toEqual({
      raizDoConteudo: resolve(FRONTEND, '..'),
      sitemapAnterior: undefined,
      contarEmLocalhost: false,
    })
  })

  it('a fixture do e2e, como o `playwright.config.ts` pede', () => {
    expect(
      lerAmbienteDoBuild({
        CONTEUDO_RAIZ: 'e2e/acervo',
        VITE_CONTAR_EM_LOCALHOST: '1',
      }),
    ).toEqual({
      raizDoConteudo: join(FRONTEND, 'e2e/acervo'),
      sitemapAnterior: undefined,
      contarEmLocalhost: true,
    })
  })

  it('caminhos absolutos valem como vieram', () => {
    expect(
      lerAmbienteDoBuild({
        CONTEUDO_RAIZ: join(PASTA, 'acervo'),
        SITEMAP_ANTERIOR: join(PASTA, 'sitemap.xml'),
      }),
    ).toMatchObject({
      raizDoConteudo: join(PASTA, 'acervo'),
      sitemapAnterior: join(PASTA, 'sitemap.xml'),
    })
  })

  it('o SITEMAP_ANTERIOR relativo parte de onde o comando rodou', () => {
    const { sitemapAnterior } = lerAmbienteDoBuild(
      { SITEMAP_ANTERIOR: 'sitemap.xml' },
      PASTA,
    )
    expect(sitemapAnterior).toBe(join(PASTA, 'sitemap.xml'))
  })

  it('uma raiz que não existe para o build antes de ler o acervo', () => {
    expect(() => lerAmbienteDoBuild({ CONTEUDO_RAIZ: 'e2e/acrevo' })).toThrow(
      'CONTEUDO_RAIZ="e2e/acrevo": esperado uma pasta que existe',
    )
  })

  it('o sitemap que falta para o build', () => {
    expect(() =>
      lerAmbienteDoBuild({ SITEMAP_ANTERIOR: '/tmp/nao-existe.xml' }),
    ).toThrow(
      'SITEMAP_ANTERIOR="/tmp/nao-existe.xml": esperado um arquivo que existe',
    )
  })

  it('a contagem em localhost só aceita 1 ou 0', () => {
    expect(() =>
      lerAmbienteDoBuild({ VITE_CONTAR_EM_LOCALHOST: 'true' }),
    ).toThrow('VITE_CONTAR_EM_LOCALHOST="true": esperado 1 ou 0')
  })
})
