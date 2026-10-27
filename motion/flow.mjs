// The flow the video shows, against the built app served on `SITE` (default:
// this checkout's `start` port, `node scripts/ports.ts`). With `--shots`, a
// screenshot per step in /tmp, to check the selectors; `record.mjs` imports
// the rest.
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../frontend/package.json', import.meta.url))
export const { chromium } = require('@playwright/test')

function startPort() {
  const ports = execFileSync('node', [
    new URL('../scripts/ports.ts', import.meta.url).pathname,
  ]).toString()
  return ports.match(/^start\t(\d+)/m)[1]
}
export const BASE = process.env.SITE ?? `http://localhost:${startPort()}`

/** The text node in `main` that starts with `start`. */
export async function textNode(page, start) {
  await page.getByText(start).first().waitFor()
  return page.evaluateHandle((start) => {
    const w = document.createTreeWalker(
      document.querySelector('main'),
      NodeFilter.SHOW_TEXT,
    )
    while (w.nextNode())
      if (w.currentNode.nodeValue.trimStart().startsWith(start))
        return w.currentNode
    throw new Error(`no text node starts with ${start}`)
  }, start)
}

/** Selects `text` inside the paragraph that starts with `start`, growing the
 * range word by word like a finger drag. Returns the range's box. */
export async function dragSelect(page, start, words, stepMs = 70) {
  const node = await textNode(page, start)
  await node.evaluate((n) =>
    n.parentElement.scrollIntoView({ block: 'center' }),
  )
  await page.waitForTimeout(250)
  const ends = await node.evaluate((n, words) => {
    const out = []
    const re = /\S+/g
    let m
    while ((m = re.exec(n.nodeValue)) && out.length < words)
      out.push(m.index + m[0].length)
    return out
  }, words)
  for (const end of ends) {
    await node.evaluate((n, end) => {
      const r = document.createRange()
      r.setStart(n, 0)
      r.setEnd(n, end)
      const s = document.getSelection()
      s.removeAllRanges()
      s.addRange(r)
    }, end)
    await page.waitForTimeout(stepMs)
  }
  // The popover opens on the end of a touch.
  await page.evaluate(() =>
    document.dispatchEvent(new Event('touchend', { bubbles: true })),
  )
}

export async function newPhone(scale = 3) {
  const browser = await chromium.launch({
    // The new headless draws with the GPU; headless-shell drops to ~20 fps.
    channel: 'chromium',
    args: [
      '--enable-gpu',
      '--ignore-gpu-blocklist',
      `--force-device-scale-factor=${scale}`,
    ],
  })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: scale,
    hasTouch: true,
    isMobile: true,
  })
  const page = await context.newPage()
  await page.route('https://stats.temestudo.cloud/**', (r) =>
    r.fulfill({ status: 204 }),
  )
  // The comment never reaches GitHub (the server has no token); the video
  // shows the "sent" a configured server answers.
  await page.route('**/_serverFn/**', async (route) => {
    const res = await route.fetch()
    // Seroval: `{"t":2,"s":3}` is false, `s:2` is true.
    const body = (await res.text()).replace(
      /("k":\["sent"\],"v":\[\{"t":2,"s":)3/,
      '$12',
    )
    await new Promise((ok) => setTimeout(ok, 500))
    await route.fulfill({ response: res, body })
  })
  return { browser, context, page }
}

if (process.argv.includes('--shots')) {
  const dir = '/tmp/tem-estudo-shots-'
  const { browser, page } = await newPhone(2)
  let n = 0
  const shot = (name) => page.screenshot({ path: `${dir}${++n}-${name}.png` })
  page.on('pageerror', (e) => console.log('pageerror', e.message))
  await page.goto(`${BASE}/onde-conhecer-pessoas`, { waitUntil: 'networkidle' })
  await dragSelect(page, 'Nos EUA, 39%', 30)
  await page.waitForTimeout(500)
  await shot('selected')
  const pop = page.getByRole('dialog', { name: 'Trecho selecionado' })
  await pop.getByRole('button', { name: 'Grifar' }).tap()
  await page.waitForTimeout(600)
  await shot('grifado')
  const hl = page.getByRole('dialog', { name: 'Grifo' })
  await hl.getByRole('button', { name: 'Escrever nota' }).tap()
  await hl.getByLabel('Nota').pressSequentially('Mandar pro grupo', { delay: 40 })
  await shot('nota')
  await hl.getByRole('button', { name: 'Salvar nota' }).tap()
  await page.waitForTimeout(500)
  await shot('nota-salva')
  await page.keyboard.press('Escape')
  await dragSelect(page, 'Vale, como um caminho', 12)
  await page.waitForTimeout(500)
  await pop.getByRole('button', { name: 'Comentar' }).tap()
  await page.waitForTimeout(400)
  await shot('comentar')
  await pop.getByRole('radio', { name: 'Falta estudo' }).tap()
  await pop.getByLabel('Seu comentário').tap()
  await pop.getByLabel('Seu comentário').pressSequentially('Tem dado do Brasil?', { delay: 40 })
  await shot('comentario')
  await pop.getByRole('button', { name: 'Enviar' }).tap()
  await page.waitForTimeout(1200)
  await shot('enviado')
  await page.goto(`${BASE}/grifos`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await shot('grifos')
  await browser.close()
}
