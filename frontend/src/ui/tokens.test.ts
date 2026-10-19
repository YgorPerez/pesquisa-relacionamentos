// Os tokens do `DESIGN.md` são o tema do Tailwind, no `@theme` de
// `tokens.css`: `--color-papel` vira `bg-papel`, `--radius-mao` vira
// `rounded-mao`, `--spacing-md` vira `p-md`, `--text-label` vira `text-label`.
// A fonte da verdade é o cabeçalho YAML do `DESIGN.md`: se um dos dois mudar
// sem o outro, este teste avisa.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import { parse } from 'yaml'

const raiz = resolve(import.meta.dirname, '../../..')

type Design = {
  colors: Record<string, string>
  rounded: Record<string, string>
  spacing: Record<string, string>
  typography: Record<
    string,
    {
      fontFamily: string
      fontSize: string
      fontWeight: number
      lineHeight: number
      letterSpacing?: string
    }
  >
}

function lerDesign(): Design {
  const texto = readFileSync(resolve(raiz, 'DESIGN.md'), 'utf8')
  const cabecalho = /^---\n([\s\S]*?)\n---/.exec(texto)?.[1]
  if (!cabecalho) throw new Error('DESIGN.md sem cabeçalho YAML')
  return parse(cabecalho) as Design
}

/** As variáveis do `@theme` de `tokens.css`, pelo nome sem `--`. */
function lerVariaveis(): Map<string, string> {
  const css = readFileSync(resolve(import.meta.dirname, 'tokens.css'), 'utf8')
  const tema = /@theme static \{([\s\S]*?)\n\}/.exec(css)?.[1]
  if (!tema) throw new Error('tokens.css sem `@theme static`')
  const variaveis = new Map<string, string>()
  for (const [, nome, valor] of tema.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    // O formatador quebra um valor longo em várias linhas; no CSS o espaço
    // a mais não conta, e aqui também não.
    const umaLinha = valor!
      .replace(/\s+/g, ' ')
      .replace(/\( /g, '(')
      .replace(/ \)/g, ')')
      .trim()
    variaveis.set(nome!, umaLinha)
  }
  return variaveis
}

const design = lerDesign()
const variaveis = lerVariaveis()

describe('o tema do Tailwind em tokens.css', () => {
  it.each(Object.entries(design.colors))(
    'tem a cor %s do DESIGN.md',
    (nome, cor) => {
      expect(variaveis.get(`color-${nome}`)).toBe(cor)
    },
  )

  it('não tem cor fora do DESIGN.md', () => {
    const cores = [...variaveis.keys()].filter((nome) =>
      nome.startsWith('color-'),
    )
    expect(cores).toEqual(
      Object.keys(design.colors).map((nome) => `color-${nome}`),
    )
  })

  it.each(Object.entries(design.rounded))(
    'tem o raio %s do DESIGN.md',
    (nome, raio) => {
      expect(variaveis.get(`radius-${nome}`)).toBe(raio)
    },
  )

  it.each(Object.entries(design.spacing))(
    'tem o espaço %s do DESIGN.md',
    (nome, espaco) => {
      expect(variaveis.get(`spacing-${nome}`)).toBe(espaco)
    },
  )

  it.each(Object.entries(design.typography))(
    'tem o tipo %s do DESIGN.md',
    (nome, tipo) => {
      expect(variaveis.get(`font-${nome}`)).toBe(tipo.fontFamily)
      expect(variaveis.get(`text-${nome}`)).toBe(tipo.fontSize)
      expect(variaveis.get(`text-${nome}--font-weight`)).toBe(
        String(tipo.fontWeight),
      )
      expect(variaveis.get(`text-${nome}--line-height`)).toBe(
        String(tipo.lineHeight),
      )
      expect(variaveis.get(`text-${nome}--letter-spacing`)).toBe(
        tipo.letterSpacing,
      )
    },
  )

  it('tem a retícula fina da elevação, deslocada 5px e 6px', () => {
    expect(variaveis.get('reticula')).toBe(
      'radial-gradient(circle, rgba(26, 28, 28, 0.62) 0.8px, transparent 1.2px) 0 0 / 4px 4px',
    )
    expect(variaveis.get('reticula-deslocamento')).toBe('translate(5px, 6px)')
  })
})
