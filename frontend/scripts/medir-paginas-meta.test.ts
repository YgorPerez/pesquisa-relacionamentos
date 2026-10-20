import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import {
  comprimeComoONginx,
  type Execucao,
  gzipDoNginx,
  linhaDe,
  mediana,
  tabela,
} from './medir-paginas-meta.ts'

const KB = 1024

function execucao(parcial: Partial<Execucao> = {}): Execucao {
  return { js: 150 * KB, css: 10 * KB, lcp: 1500, inp: 40, ...parcial }
}

describe('a meta de cada página', () => {
  it('o início que cabe na meta passa', () => {
    expect(linhaDe('início', [execucao(), execucao(), execucao()])).toEqual({
      pagina: 'início',
      jsKb: 150,
      cssKb: 10,
      lcpMs: 1500,
      inpMs: 40,
      falhas: [],
    })
  })

  it('lê a mediana, e uma abertura lenta sozinha não reprova', () => {
    const linha = linhaDe('Ficha', [
      execucao({ lcp: 1400 }),
      execucao({ lcp: 9000, inp: 900 }),
      execucao({ lcp: 1600 }),
    ])
    expect(linha.lcpMs).toBe(1600)
    expect(linha.falhas).toEqual([])
  })

  it('diz cada número que passou da meta', () => {
    const lenta = execucao({ js: 400 * KB, css: 40 * KB, lcp: 3000, inp: 300 })
    expect(linhaDe('Guia', [lenta]).falhas).toEqual(['JS', 'CSS', 'LCP', 'INP'])
  })

  // O Guia leva mais JS que o início, e a meta é da página.
  it('o JS do Guia cabe numa meta que o início não tem', () => {
    const doGuia = execucao({ js: 240 * KB })
    expect(linhaDe('Guia', [doGuia]).falhas).toEqual([])
    expect(linhaDe('início', [doGuia]).falhas).toEqual(['JS'])
  })

  it('uma página que não mediu reprova', () => {
    expect(linhaDe('Prioridades', []).falhas).toContain('sem medida')
  })

  it('a mediana de um número par de valores é a média dos do meio', () => {
    expect(mediana([4, 1, 3, 2])).toBe(2.5)
  })

  it('a tabela traz o número e a meta de cada coluna', () => {
    expect(tabela([linhaDe('Grupo possível', [execucao({ inp: 250 })])]))
      .toBe(`| Página | JS | CSS | LCP | INP | Passa? |
|---|---|---|---|---|---|
| Grupo possível | 150,0 KB (≤ 250) | 10,0 KB (≤ 15) | 1,50 s (≤ 2,5) | 250 ms (≤ 200) | não (INP) |`)
  })
})

const CONF = readFileSync(
  join(import.meta.dirname, '../nginx/temestudo.conf'),
  'utf8',
)

describe('o gzip do Nginx, que a medida local imita', () => {
  it('lê os tipos e o nível do temestudo.conf', () => {
    expect(gzipDoNginx(CONF)).toEqual({
      nivel: 1,
      tipos: [
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/json',
        'image/svg+xml',
        'text/plain',
        'application/xml',
      ],
    })
  })

  it('o nível escrito no conf vale no lugar do 1 do Nginx', () => {
    expect(gzipDoNginx('gzip on;\ngzip_comp_level 5;').nivel).toBe(5)
  })

  // O servidor do app manda o JS como `text/javascript`; o Nginx que só
  // listava `application/javascript` o mandava cru.
  it('comprime o JS do app, o CSS e a página, e não a fonte', () => {
    const gzip = gzipDoNginx(CONF)
    expect(comprimeComoONginx('text/javascript; charset=utf-8', gzip)).toBe(
      true,
    )
    expect(comprimeComoONginx('text/css; charset=utf-8', gzip)).toBe(true)
    expect(comprimeComoONginx('text/html; charset=utf-8', gzip)).toBe(true)
    expect(comprimeComoONginx('font/woff2', gzip)).toBe(false)
    expect(comprimeComoONginx(undefined, gzip)).toBe(false)
  })
})
