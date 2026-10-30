// Every text a library chart writes reads at WCAG AA on what lies under it
// (#470). axe cannot measure text inside an SVG, so the accessibility e2e
// leaves the charts' text to this test (decided for spec #470 on
// 2026-10-30). The colours come from `tokens.css` through the variables the
// plot and its layer use (`chart-tones.ts`, `stack-tones.ts`); every chart
// text is under 18px, or bold under 14pt, so all of it is normal text:
// 4.5:1.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import {
  ACTIVE,
  ACTIVE_OPACITY,
  DIMMED,
  INK,
  MARKER,
  MUTED,
  PAPER,
  YOU,
} from './chart-tones'
import { partTone } from './stack-tones'

const AA = 4.5

const tokens = readFileSync(resolve(import.meta.dirname, 'tokens.css'), 'utf8')

/** `var(--color-x)` as the hex `tokens.css` gives it, in 0–255 channels. */
function rgb(variable: string): [number, number, number] {
  const name = /^var\((--[\w-]+)\)$/.exec(variable)?.[1]
  const hex = name && new RegExp(`${name}:\\s*#([0-9a-f]{6});`).exec(tokens)
  if (!hex?.[1]) throw new Error(`tokens.css has no hex for ${variable}`)
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex[1]!.slice(i, i + 2), 16))
  return [r!, g!, b!]
}

/** Ink at `opacity` over the paper, as the browser blends it. */
const inkOver = (opacity: number): [number, number, number] => {
  const ink = rgb(INK)
  const paper = rgb(PAPER)
  return [0, 1, 2].map(
    (i) => opacity * ink[i]! + (1 - opacity) * paper[i]!,
  ) as [number, number, number]
}

/** WCAG 2 relative luminance. */
function luminance([r, g, b]: [number, number, number]) {
  const linear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

function contrast(a: [number, number, number], b: [number, number, number]) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light! + 0.05) / (dark! + 0.05)
}

describe('the text of a library chart', () => {
  it.each([
    ['ink (labels, values) on the paper', INK, PAPER],
    ['muted ink (axis, a dimmed point) on the paper', MUTED, PAPER],
    ['the key value on its pink marker', INK, MARKER],
    ['the "você" tag on its yellow', INK, YOU],
  ])('reads at AA: %s', (_, text, under) => {
    expect(contrast(rgb(text), rgb(under))).toBeGreaterThanOrEqual(AA)
  })

  it('reads at AA on the verde-água behind the active row', () => {
    const paper = rgb(PAPER)
    const band = rgb(ACTIVE).map(
      (c, i) => ACTIVE_OPACITY * c + (1 - ACTIVE_OPACITY) * paper[i]!,
    ) as [number, number, number]
    expect(contrast(rgb(INK), band)).toBeGreaterThanOrEqual(AA)
    expect(contrast(rgb(MUTED), band)).toBeGreaterThanOrEqual(AA)
  })

  // Stacked bars write each part's value inside it (12px bold); a dimmed
  // bar writes ink over its faded parts.
  it.each([2, 3, 4, 5, 6, 7, 8])(
    'reads at AA inside every part of a stacked bar of %i parts, lit or dimmed',
    (parts) => {
      for (let part = 0; part < parts; part++) {
        const tone = partTone(part, parts)
        expect(
          contrast(rgb(tone.text), inkOver(tone.opacity)),
          `part ${part}`,
        ).toBeGreaterThanOrEqual(AA)
        expect(
          contrast(rgb(INK), inkOver(tone.opacity * DIMMED)),
          `part ${part}, dimmed`,
        ).toBeGreaterThanOrEqual(AA)
      }
    },
  )
})
