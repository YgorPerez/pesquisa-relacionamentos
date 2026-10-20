// The fixed link-preview image (Open Graph), 1200×630, in the DESIGN.md
// style: cool paper with halftone, the sheet with an outline and a halftone
// shadow, the site name with the word in yellow, the site's sentence and a
// margin note with the arrow to the reference. It is drawn in HTML with the
// site's fonts and photographed by the machine's Chrome (the same as the e2e).
//
//   node scripts/og-image.ts      writes public/og.png
//
// Run again when the name, the sentence or the inks change.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const here = import.meta.dirname
const font = (file: string) =>
  `url(data:font/woff2;base64,${readFileSync(resolve(here, '../src/fonts', file)).toString('base64')}) format('woff2')`

const HIGHLIGHTER =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 40' preserveAspectRatio='none'%3E%3Cpath d='M4 8C50 6 130 7 196 5l1 8-1 9 1 9-3 3C130 33 60 33 5 35l-2-8 1-9-1-8z' fill='%23ecd36f'/%3E%3C/svg%3E\")"

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><style>
@font-face { font-family: Bricolage; src: ${font('bricolage-grotesque-latin-wght-normal.woff2')}; font-weight: 200 800; }
@font-face { font-family: Atkinson; src: ${font('atkinson-hyperlegible-latin-400-normal.woff2')}; font-weight: 400; }
@font-face { font-family: Atkinson; src: ${font('atkinson-hyperlegible-latin-700-normal.woff2')}; font-weight: 700; }
@font-face { font-family: Kalam; src: ${font('kalam-latin-400-normal.woff2')}; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; }
body {
  background: #f5f8f8 radial-gradient(circle, rgba(26,28,28,.12) 1.2px, transparent 1.8px) 0 0 / 9px 9px;
  color: #1a1c1c; font-family: Atkinson, sans-serif;
  display: grid; place-items: center;
}
.sheet { position: relative; width: 1056px; height: 486px; }
.sheet::before {
  content: ''; position: absolute; inset: -3px; border-radius: 14px 6px 12px 8px / 8px 12px 6px 14px;
  background: radial-gradient(circle, rgba(26,28,28,.62) 1.4px, transparent 2px) 0 0 / 7px 7px;
  transform: translate(12px, 14px);
}
.inside {
  position: absolute; inset: 0; background: #fcfdfd; border: 4px solid #1a1c1c;
  border-radius: 14px 6px 12px 8px / 8px 12px 6px 14px; padding: 58px 76px;
}
.site { font-weight: 700; font-size: 30px; color: #414948; letter-spacing: .01em; }
h1 {
  font-family: Bricolage, sans-serif; font-weight: 700; font-size: 148px; line-height: 1.02;
  letter-spacing: -0.022em; margin-top: 26px;
}
.highlight { position: relative; z-index: 0; white-space: nowrap; }
.highlight::before {
  content: ''; position: absolute; z-index: -1; left: -12px; right: -14px; top: 10%; bottom: -6%;
  background: ${HIGHLIGHTER} center / 100% 100% no-repeat; transform: rotate(-0.5deg);
}
.sentence { font-size: 42px; line-height: 1.3; margin-top: 30px; max-width: 600px; }
.ref {
  display: inline-grid; place-items: center; width: 50px; height: 50px; margin-left: 10px;
  border: 3.5px solid #0d6359; border-radius: 50% 47% 52% 48%; color: #0d6359;
  font-weight: 700; font-size: 30px; vertical-align: 4px;
}
.note {
  position: absolute; right: 72px; bottom: 62px; display: flex; align-items: flex-start; gap: 4px;
  font-family: Kalam, cursive; font-size: 34px; color: #0d6359; line-height: 1.1; text-align: right;
}
</style></head><body>
<div class="sheet"><div class="inside">
  <p class="site">temestudo.cloud</p>
  <h1>Tem <span class="highlight">estudo</span>?</h1>
  <p class="sentence">Dúvida de relacionamento, com a fonte junto<span class="ref">1</span></p>
  <div class="note">
    <svg width="110" height="60" viewBox="0 0 110 60" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M104 22C76 44 42 50 8 40M8 40l15-14M8 40l17 9" />
    </svg>
    <span>cada resposta<br>leva ao estudo</span>
  </div>
</div></div>
</body></html>`

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
})
await page.setContent(html)
await page.evaluate(() => document.fonts.ready)
const target = resolve(here, '../public/og.png')
await page.screenshot({ path: target })
await browser.close()
console.log(`wrote ${target}`)
