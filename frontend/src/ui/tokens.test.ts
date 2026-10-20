// The `DESIGN.md` tokens are the Tailwind theme, in the `@theme` of
// `tokens.css`: `--color-papel` becomes `bg-papel`, `--radius-mao` becomes
// `rounded-mao`, `--spacing-md` becomes `p-md`, `--text-label` becomes
// `text-label`. The source of truth is the `DESIGN.md` YAML header: if one of
// the two changes without the other, this test says so.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import { parse } from 'yaml'

const root = resolve(import.meta.dirname, '../../..')

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

function readDesign(): Design {
  const text = readFileSync(resolve(root, 'DESIGN.md'), 'utf8')
  const header = /^---\n([\s\S]*?)\n---/.exec(text)?.[1]
  if (!header) throw new Error('DESIGN.md has no YAML header')
  return parse(header) as Design
}

/** The `@theme` variables of `tokens.css`, by name without `--`. */
function readVariables(): Map<string, string> {
  const css = readFileSync(resolve(import.meta.dirname, 'tokens.css'), 'utf8')
  const theme = /@theme static \{([\s\S]*?)\n\}/.exec(css)?.[1]
  if (!theme) throw new Error('tokens.css has no `@theme static`')
  const variables = new Map<string, string>()
  for (const [, name, value] of theme.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    // The formatter breaks a long value over several lines; in CSS the extra
    // space does not count, and here neither.
    const oneLine = value!
      .replace(/\s+/g, ' ')
      .replace(/\( /g, '(')
      .replace(/ \)/g, ')')
      .trim()
    variables.set(name!, oneLine)
  }
  return variables
}

const design = readDesign()
const variables = readVariables()

describe('the Tailwind theme in tokens.css', () => {
  it.each(Object.entries(design.colors))(
    'has the color %s from DESIGN.md',
    (name, color) => {
      expect(variables.get(`color-${name}`)).toBe(color)
    },
  )

  it('has no color outside DESIGN.md', () => {
    const colors = [...variables.keys()].filter((name) =>
      name.startsWith('color-'),
    )
    expect(colors).toEqual(
      Object.keys(design.colors).map((name) => `color-${name}`),
    )
  })

  it.each(Object.entries(design.rounded))(
    'has the radius %s from DESIGN.md',
    (name, radius) => {
      expect(variables.get(`radius-${name}`)).toBe(radius)
    },
  )

  it.each(Object.entries(design.spacing))(
    'has the spacing %s from DESIGN.md',
    (name, space) => {
      expect(variables.get(`spacing-${name}`)).toBe(space)
    },
  )

  it.each(Object.entries(design.typography))(
    'has the type %s from DESIGN.md',
    (name, type) => {
      expect(variables.get(`font-${name}`)).toBe(type.fontFamily)
      expect(variables.get(`text-${name}`)).toBe(type.fontSize)
      expect(variables.get(`text-${name}--font-weight`)).toBe(
        String(type.fontWeight),
      )
      expect(variables.get(`text-${name}--line-height`)).toBe(
        String(type.lineHeight),
      )
      expect(variables.get(`text-${name}--letter-spacing`)).toBe(
        type.letterSpacing,
      )
    },
  )

  it('has the fine elevation halftone, offset 5px and 6px', () => {
    expect(variables.get('reticula')).toBe(
      'radial-gradient(circle, rgba(26, 28, 28, 0.62) 0.8px, transparent 1.2px) 0 0 / 4px 4px',
    )
    expect(variables.get('reticula-deslocamento')).toBe('translate(5px, 6px)')
  })
})
