// The brand colors outside the CSS are DESIGN.md's, and the manifest and the
// icons in `public/` are the ones `brand.ts` describes today.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import { parse } from 'yaml'
import { BRAND_COLORS, SITE_ICONS, manifest } from './brand'

const root = resolve(import.meta.dirname, '../../..')
const publicDir = resolve(import.meta.dirname, '../../public')

function designColors(): Record<string, string> {
  const text = readFileSync(resolve(root, 'DESIGN.md'), 'utf8')
  const header = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? ''
  return (parse(header) as { colors: Record<string, string> }).colors
}

describe('the brand', () => {
  it.each(Object.entries(BRAND_COLORS))(
    'the color %s is the DESIGN.md one',
    (name, color) => {
      expect(designColors()[name]).toBe(color)
    },
  )

  it('the manifest in public/ is the one brand.ts builds', () => {
    const written = JSON.parse(
      readFileSync(resolve(publicDir, 'manifest.webmanifest'), 'utf8'),
    )
    expect(written).toEqual(manifest())
  })

  it.each(SITE_ICONS.map((i) => i.file))('%s is in public/', (a) => {
    expect(existsSync(resolve(publicDir, a))).toBe(true)
  })

  it('the manifest carries the 192 and 512px icons', () => {
    expect(manifest().icons.map((i) => i.sizes)).toEqual(['192x192', '512x512'])
  })
})
