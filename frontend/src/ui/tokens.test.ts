// Os tokens do `DESIGN.md` chegam aos componentes como variáveis CSS em
// `tokens.css`. A fonte da verdade é o cabeçalho YAML do `DESIGN.md`: se um
// dos dois mudar sem o outro, este teste avisa.

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
    }
  >
}

function lerDesign(): Design {
  const texto = readFileSync(resolve(raiz, 'DESIGN.md'), 'utf8')
  const cabecalho = /^---\n([\s\S]*?)\n---/.exec(texto)?.[1]
  if (!cabecalho) throw new Error('DESIGN.md sem cabeçalho YAML')
  return parse(cabecalho) as Design
}

/** As variáveis declaradas no `:root` de `tokens.css`, pelo nome sem `--`. */
function lerVariaveis(): Map<string, string> {
  const css = readFileSync(resolve(import.meta.dirname, 'tokens.css'), 'utf8')
  const variaveis = new Map<string, string>()
  for (const [, nome, valor] of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
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

describe('tokens.css', () => {
  it.each(Object.entries(design.colors))(
    'tem a cor %s do DESIGN.md',
    (nome, cor) => {
      expect(variaveis.get(`cor-${nome}`)).toBe(cor)
    },
  )

  it.each(Object.entries(design.rounded))(
    'tem o raio %s do DESIGN.md',
    (nome, raio) => {
      expect(variaveis.get(`raio-${nome}`)).toBe(raio)
    },
  )

  it.each(Object.entries(design.spacing))(
    'tem o espaço %s do DESIGN.md',
    (nome, espaco) => {
      expect(variaveis.get(`espaco-${nome}`)).toBe(espaco)
    },
  )

  it.each(Object.entries(design.typography))(
    'tem o tipo %s do DESIGN.md',
    (nome, tipo) => {
      expect(variaveis.get(`tipo-${nome}-familia`)).toBe(tipo.fontFamily)
      expect(variaveis.get(`tipo-${nome}-tamanho`)).toBe(tipo.fontSize)
      expect(variaveis.get(`tipo-${nome}-peso`)).toBe(String(tipo.fontWeight))
      expect(variaveis.get(`tipo-${nome}-altura`)).toBe(String(tipo.lineHeight))
    },
  )

  it('tem a retícula fina da elevação, deslocada 5px e 6px', () => {
    expect(variaveis.get('reticula')).toBe(
      'radial-gradient(circle, rgba(26, 28, 28, 0.62) 0.8px, transparent 1.2px) 0 0 / 4px 4px',
    )
    expect(variaveis.get('reticula-deslocamento')).toBe('translate(5px, 6px)')
  })
})
