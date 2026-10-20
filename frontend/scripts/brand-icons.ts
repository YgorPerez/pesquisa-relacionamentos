// Makes the site's icons and the manifest from the DESIGN.md brand
// (`src/ui/brand.ts`), and writes them to `public/`, from where the server
// serves them at the root. Modeled on the Festival dos Macacos'
// `scripts/icones-da-marca.ts`.
//
//   node scripts/brand-icons.ts
//
// The drawing is the site title's: the "?" in Bricolage, in ink, over the
// yellow highlighter, on paper. It takes 80% of the side: Android crops the
// icon into a circle, and only what fits in it shows on every device. Run
// again when the brand changes; `brand.test.ts` checks the manifest.

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { BRAND_COLORS, SITE_ICONS, manifest } from '../src/ui/brand.ts'

const FRONT = join(import.meta.dirname, '..')
const PUBLIC = join(FRONT, 'public')
const BRICOLAGE = join(
  FRONT,
  'src/fonts/bricolage-grotesque-latin-wght-normal.woff2',
)

const dataUrl = (file: string, type: string) =>
  `data:${type};base64,${readFileSync(file).toString('base64')}`

/** The title's highlighter (`.marca-texto` in `ui/drawings.css`). */
const HIGHLIGHTER = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40' preserveAspectRatio='none'%3E%3Cpath d='M4 8C50 6 130 7 196 5l1 8-1 9 1 9-3 3C130 33 60 33 5 35l-2-8 1-9-1-8z' fill='${encodeURIComponent(BRAND_COLORS['amarelo-voce'])}'/%3E%3C/svg%3E")`

/** The page that draws the icon, in units of its side. */
const DRAWING = `<style>
  @font-face{font-family:Bricolage;font-weight:500 800;src:url(${dataUrl(BRICOLAGE, 'font/woff2')})}
  html,body{margin:0;height:100%}
  body{display:grid;place-items:center;background:${BRAND_COLORS.papel}}
  span{position:relative;z-index:0;font:700 72vw/1 Bricolage;color:${BRAND_COLORS.tinta}}
  span::before{content:'';position:absolute;z-index:-1;left:-14vw;right:-14vw;top:18%;bottom:6%;
    background:${HIGHLIGHTER} center / 100% 100% no-repeat;transform:rotate(-0.5deg)}
</style><span>?</span>`

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
for (const { file, size } of SITE_ICONS) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(DRAWING)
  await page.evaluate(() => document.fonts.ready)
  const target = join(PUBLIC, file)
  await page.screenshot({ path: target })
  console.log(target)
}
await browser.close()

const target = join(PUBLIC, 'manifest.webmanifest')
writeFileSync(target, `${JSON.stringify(manifest(), null, 2)}\n`)
console.log(target)
