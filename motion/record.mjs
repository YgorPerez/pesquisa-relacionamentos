// Records the flow as a 30 fps MP4 at 3x (video/public/flow.mp4) and the time
// and place of each touch (video/src/events.json), via the CDP screencast.
// Needs a full ffmpeg (`FFMPEG`, else the one on the PATH): the concat
// demuxer and libx264.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BASE, dragSelect, newPhone, textNode } from './flow.mjs'

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg'
const here = (p) => new URL(p, import.meta.url).pathname
const { browser, context, page } = await newPhone(3)
page.on('pageerror', (e) => console.log('pageerror', e.message))

const grifar = async (path, start, words, note) => {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await dragSelect(page, start, words, 0)
  await page
    .getByRole('dialog', { name: 'Trecho selecionado' })
    .getByRole('button', { name: 'Grifar' })
    .tap()
  if (note) {
    const hl = page.getByRole('dialog', { name: 'Grifo' })
    await hl.getByRole('button', { name: 'Escrever nota' }).tap()
    await hl.getByLabel('Nota').fill(note)
    await hl.getByRole('button', { name: 'Salvar nota' }).tap()
  }
}
// Off camera: two Grifos on Dicas, so /grifos has a list.
await grifar('/dicas/humor', 'O humor pesa diferente', 6, 'kkkk faz sentido')
await grifar('/dicas/aprofundar-a-conversa', 'Aprofunde a conversa', 11)

// The screencast only sends a frame when the screen changes: a dot that
// never stops changing, on every page, makes it send them all.
await context.addInitScript(() =>
  addEventListener('DOMContentLoaded', () => {
    const dot = document.createElement('div')
    dot.style.cssText =
      'position:fixed;left:0;top:0;width:2px;height:2px;pointer-events:none;z-index:2147483647'
    dot.animate([{ background: '#f5f8f8' }, { background: '#f4f8f8' }], {
      duration: 50,
      iterations: Infinity,
      direction: 'alternate',
    })
    document.documentElement.append(dot)
    // No red spellcheck squiggle under what the video types.
    addEventListener('focusin', (e) => (e.target.spellcheck = false), true)
  }),
)
await page.goto(`${BASE}/onde-conhecer-pessoas`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
// Start with the sentence already in view.
await (await textNode(page, 'Nos EUA, 39%')).evaluate((n) =>
  n.parentElement.scrollIntoView({ block: 'center' }),
)
await page.waitForTimeout(500)

const cdp = await context.newCDPSession(page)
const temp = mkdtempSync(join(tmpdir(), 'tev-frames-'))
const frames = []
const writing = []
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  const file = join(temp, `${String(frames.length).padStart(5, '0')}.jpg`)
  frames.push({ file, t: metadata.timestamp })
  writing.push(writeFile(file, Buffer.from(data, 'base64')))
})
await cdp.send('Page.startScreencast', {
  format: 'jpeg',
  quality: 95,
  maxWidth: 1170,
  maxHeight: 2532,
})
const t0 = Date.now() / 1000
const now = () => Number((Date.now() / 1000 - t0).toFixed(3))
const events = []
const mark = (type, extra = {}) => events.push({ t: now(), type, ...extra })

/** Taps the button, marking where and when. */
async function tap(locator, label) {
  await locator.waitFor()
  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)
  const r = await locator.boundingBox()
  const x = Math.round(r.x + r.width / 2)
  const y = Math.round(r.y + r.height / 2)
  mark('tap', { x, y, label })
  await page.waitForTimeout(120)
  await locator.tap()
}
/** A selection drag, marking its start and end points. */
async function select(start, words) {
  const node = await textNode(page, start)
  await node.evaluate((n) =>
    n.parentElement.scrollIntoView({ block: 'center', behavior: 'smooth' }),
  )
  await page.waitForTimeout(450)
  const box = await node.evaluate((n) => {
    const r = document.createRange()
    r.selectNodeContents(n)
    const b = r.getClientRects()[0]
    return { x: b.x, y: b.y }
  })
  mark('press', { x: Math.round(box.x + 6), y: Math.round(box.y + 14) })
  await page.waitForTimeout(250)
  await dragSelect(page, start, words, 45)
  const end = await page.evaluate(() => {
    const r = document.getSelection().getRangeAt(0).getClientRects()
    const last = r[r.length - 1]
    return { x: Math.round(last.right), y: Math.round(last.top + last.height / 2) }
  })
  mark('release', end)
}

await page.waitForTimeout(400)
mark('grifar-start')
await select('Nos EUA, 39%', 30)
await page.waitForTimeout(600)
const pop = page.getByRole('dialog', { name: 'Trecho selecionado' })
await tap(pop.getByRole('button', { name: 'Grifar' }), 'Grifar')
await page.waitForTimeout(900)

mark('nota-start')
const hl = page.getByRole('dialog', { name: 'Grifo' })
await tap(hl.getByRole('button', { name: 'Escrever nota' }), 'Escrever nota')
await page.waitForTimeout(250)
await hl.getByLabel('Nota').pressSequentially('Mandar pro grupo 👀', { delay: 55 })
await page.waitForTimeout(300)
await tap(hl.getByRole('button', { name: 'Salvar nota' }), 'Salvar nota')
await page.waitForTimeout(900)
await page.keyboard.press('Escape')
await page.evaluate(() => document.getSelection().removeAllRanges())
await page.waitForTimeout(300)

mark('comentar-start')
await select('Vale, como um caminho', 12)
await page.waitForTimeout(500)
await tap(pop.getByRole('button', { name: 'Comentar' }), 'Comentar')
await page.waitForTimeout(450)
await tap(pop.getByRole('radio', { name: 'Falta estudo' }), 'Falta estudo')
await page.waitForTimeout(250)
const field = pop.getByLabel('Seu comentário')
await tap(field, 'campo')
await field.pressSequentially('Tem dado do Brasil?', { delay: 55 })
await page.waitForTimeout(300)
await tap(pop.getByRole('button', { name: 'Enviar' }), 'Enviar')
await pop.getByText('Comentário enviado').waitFor()
mark('enviado')
await page.waitForTimeout(1300)

mark('grifos-start')
await page.goto(`${BASE}/grifos`, { waitUntil: 'networkidle' })
mark('grifos-loaded')
await page.waitForTimeout(700)
await page.evaluate(() => window.scrollTo({ top: 330, behavior: 'smooth' }))
await page.waitForTimeout(2200)
mark('end')

await cdp.send('Page.stopScreencast')
await Promise.all(writing)
await browser.close()

// Each frame lasts until the next one: the concat demuxer, then 30 fps.
const lines = []
for (let i = 0; i < frames.length; i++) {
  const next = frames[i + 1]?.t ?? frames[i].t + 1 / 30
  lines.push(`file '${frames[i].file}'`, `duration ${(next - frames[i].t).toFixed(4)}`)
}
lines.push(`file '${frames.at(-1).file}'`)
const list = join(temp, 'list.txt')
writeFileSync(list, lines.join('\n'))
// The screencast's clock and Date.now() start apart: line the events up.
const shift = Number((frames[0].t - t0).toFixed(3))
mkdirSync(here('./video/public'), { recursive: true })
mkdirSync(here('./video/src'), { recursive: true })
execFileSync(FFMPEG, [
  '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list,
  '-vf', 'fps=30,scale=1170:2532,format=yuv420p',
  '-c:v', 'libx264', '-crf', '12', '-preset', 'slow',
  here('./video/public/flow.mp4'),
])
writeFileSync(
  here('./video/src/events.json'),
  JSON.stringify(
    events.map((e) => ({ ...e, t: Number((e.t - shift).toFixed(3)) })),
    null,
    1,
  ),
)
const span = frames.at(-1).t - frames[0].t
console.log(`${frames.length} frames in ${span.toFixed(1)} s = ${(frames.length / span).toFixed(1)} fps`)
rmSync(temp, { recursive: true })
