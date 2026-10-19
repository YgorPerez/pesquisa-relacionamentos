// As cores da marca fora do CSS são as do DESIGN.md, e o manifesto e os
// ícones que estão em `public/` são os que `marca.ts` descreve hoje.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import { parse } from 'yaml'
import { CORES_DA_MARCA, ICONES_DO_SITE, manifesto } from './marca'

const raiz = resolve(import.meta.dirname, '../../..')
const publico = resolve(import.meta.dirname, '../../public')

function coresDoDesign(): Record<string, string> {
  const texto = readFileSync(resolve(raiz, 'DESIGN.md'), 'utf8')
  const cabecalho = /^---\n([\s\S]*?)\n---/.exec(texto)?.[1] ?? ''
  return (parse(cabecalho) as { colors: Record<string, string> }).colors
}

describe('a marca', () => {
  it.each(Object.entries(CORES_DA_MARCA))(
    'a cor %s é a do DESIGN.md',
    (nome, cor) => {
      expect(coresDoDesign()[nome]).toBe(cor)
    },
  )

  it('o manifesto em public/ é o que marca.ts monta', () => {
    const gravado = JSON.parse(
      readFileSync(resolve(publico, 'manifest.webmanifest'), 'utf8'),
    )
    expect(gravado).toEqual(manifesto())
  })

  it.each(ICONES_DO_SITE.map((i) => i.arquivo))('%s está em public/', (a) => {
    expect(existsSync(resolve(publico, a))).toBe(true)
  })

  it('o manifesto leva os ícones de 192 e 512px', () => {
    expect(manifesto().icons.map((i) => i.sizes)).toEqual([
      '192x192',
      '512x512',
    ])
  })
})
