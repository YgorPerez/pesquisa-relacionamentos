// Captures an app route on mobile (390×844) and desktop (1280×800), for a
// PR's screen evidence (docs/agents/evidencia-de-tela.md) and for critique:
// `node scripts/capture.ts <route> [options]` (`--help` lists the options).
// Came from the Festival dos Macacos' `capturar.ts`.
//
// Uses the machine's Chrome (`channel: 'chrome'`), like the e2e. Motion goes
// reduced, so the capture comes out in the final state and not in the middle
// of an entrance; with `--video`, it goes on, because the video exists to
// show it. Playwright records .webm; with `ffmpeg` on the PATH, it comes out
// as .mp4, which plays in every browser, Safari included.
//
// The default app is this checkout's `pnpm start`, and the Storybook its
// `pnpm storybook` (`scripts/portas.ts`).
//
// With `--story <id> --at 0,500,1000`, photographs a Storybook story at
// moments of the animation, instead of a route (`captureStory`).

import { execFileSync } from 'node:child_process'
import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type Browser, chromium, type Page } from '@playwright/test'
import { portaPedida } from '../../scripts/portas.ts'
import {
  indexIds,
  similarIds,
  readArguments,
  type Options,
  type StoryOptions,
  SCREENS,
  type Screen,
  USAGE,
} from './capture-arguments.ts'

const openBrowser = () => chromium.launch({ channel: 'chrome' })

/** A screen's context: the size, the mobile touch and the language. */
function ofScreen(screen: Screen, motion: boolean) {
  return {
    viewport: SCREENS[screen],
    deviceScaleFactor: 2,
    isMobile: screen === 'mobile',
    hasTouch: screen === 'mobile',
    reducedMotion: motion ? ('no-preference' as const) : ('reduce' as const),
    locale: 'pt-BR',
  }
}

/** Waits for the fonts and the images: without it, the capture came out with
 * the system font and a hole in place of the photo. */
async function settled(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await page
    .waitForFunction(
      () => [...document.images].every((image) => image.complete),
      undefined,
      { timeout: 15_000 },
    )
    .catch(() => console.error('Some image did not arrive in 15s.'))
}

/** An error screen in the capture is almost always a read that failed, and
 * the reason only shows up here. */
function reportFailures(page: Page, screen: Screen) {
  page.on('pageerror', (error) =>
    console.error(`[${screen}] page error: ${error.message}`),
  )
  page.on('response', (response) => {
    if (response.status() >= 400)
      console.error(
        `[${screen}] ${response.status()}: ${response.request().method()} ${response.url()}`,
      )
  })
}

/** One screen, in a context of its own; returns the files written, the
 * screenshot and, with `--video`, the video. */
async function captureScreen(
  browser: Browser,
  options: Options,
  screen: Screen,
) {
  const context = await browser.newContext({
    ...ofScreen(screen, options.video),
    ...(options.video && {
      recordVideo: { dir: options.out, size: SCREENS[screen] },
    }),
  })
  const page = await context.newPage()
  reportFailures(page, screen)
  await page.goto(`${options.base}${options.route}`, { waitUntil: 'load' })
  await settled(page)
  for (const selector of options.taps) {
    // In the video, whoever watches needs to see the screen before it
    // changes.
    if (options.video) await page.waitForTimeout(800)
    await page.locator(selector).first().click()
    await settled(page)
  }
  const file = join(options.out, `${options.name}-${screen}.png`)
  await page.screenshot({ path: file, fullPage: options.full })
  if (!options.video) {
    await context.close()
    return [file]
  }
  await page.waitForTimeout(1200)
  const video = page.video()
  // Playwright only finishes writing the video when the context closes.
  await context.close()
  const webm = join(options.out, `${options.name}-${screen}.webm`)
  await video?.saveAs(webm)
  await video?.delete()
  return [file, await toMp4(webm)]
}

/** The .webm as .mp4 with the PATH's `ffmpeg`, or the .webm itself without
 * it. */
async function toMp4(webm: string): Promise<string> {
  const mp4 = webm.replace(/\.webm$/, '.mp4')
  try {
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-loglevel',
        'error',
        '-i',
        webm,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        mp4,
      ],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    )
  } catch {
    // Without `ffmpeg`, the .webm stays, which GitHub also plays.
    return webm
  }
  await rm(webm)
  return mp4
}

async function capture(options: Options) {
  await mkdir(options.out, { recursive: true })
  const browser = await openBrowser()
  const written: string[] = []
  try {
    for (const screen of options.screens)
      written.push(...(await captureScreen(browser, options, screen)))
  } finally {
    await browser.close()
  }
  return written
}

/** The clock step between one frame and the next, as on a 60 Hz screen. */
const FRAME_MS = 16
/** A fixed date on the page's clock: the story comes out the same in every
 * capture. */
const CLOCK_START = new Date('2026-10-03T15:00:00-03:00')

/** Photographs a story at each requested moment. The page's clock is
 * Playwright's, stopped since before the story loads: `setTimeout`,
 * `requestAnimationFrame` and `performance.now` only move when the capture
 * says so, frame by frame. CSS animations run on the browser's clock, which
 * Playwright does not stop; so each one is paused as soon as it appears and
 * set to the moment the page is at (`settle`). */
async function captureStory(options: StoryOptions) {
  await checkId(options)
  await mkdir(options.out, { recursive: true })
  const browser = await openBrowser()
  try {
    const context = await browser.newContext(ofScreen(options.screen, true))
    const page = await context.newPage()
    reportFailures(page, options.screen)
    await page.clock.install({ time: CLOCK_START.getTime() - 60_000 })
    await page.clock.pauseAt(CLOCK_START)
    await page.goto(
      `${options.base}/iframe.html?id=${encodeURIComponent(options.story)}&viewMode=story`,
    )
    await storyOnScreen(page)
    await page.evaluate(settle)
    await page.evaluate(() => document.fonts.ready)
    await until(page, () => [...document.images].every((i) => i.complete))
    await page.evaluate(settle)
    return await photographMoments(page, options)
  } finally {
    await browser.close()
  }
}

async function photographMoments(page: Page, options: StoryOptions) {
  const width = String(options.moments.at(-1)).length
  const written: string[] = []
  let now = 0
  for (const moment of options.moments) {
    while (now < moment) {
      const step = Math.min(FRAME_MS, moment - now)
      await page.clock.runFor(step)
      now += step
      await page.evaluate(settle)
    }
    const ms = String(moment).padStart(width, '0')
    const file = join(
      options.out,
      `${options.name}-${options.screen}-${ms}ms.png`,
    )
    await page.screenshot({ path: file })
    written.push(file)
  }
  return written
}

/** Pauses each new animation and sets all of them to the page clock's
 * moment, counted from when each one appeared. Before that, lets React draw
 * what the last clock step changed: it schedules the drawing through
 * `MessageChannel`, which Playwright's clock does not control. Runs in the
 * page. */
async function settle() {
  for (let i = 0; i < 3; i++)
    await new Promise<void>((ready) => {
      const channel = new MessageChannel()
      channel.port1.onmessage = () => ready()
      channel.port2.postMessage(null)
    })
  const page = window as typeof window & {
    __births?: WeakMap<Animation, number>
  }
  page.__births ??= new WeakMap()
  const now = performance.now()
  for (const animation of document.getAnimations()) {
    let birth = page.__births.get(animation)
    if (birth === undefined) {
      birth = now
      page.__births.set(animation, now)
      animation.pause()
    }
    animation.currentTime = now - birth
  }
}

/** Waits for the story to mount and its `play` to finish, without waiting for
 * Storybook to call the story ready: before that it waits for the animations
 * to end, in a `setTimeout` the stopped clock never fires. */
async function storyOnScreen(page: Page) {
  await until(page, () => {
    const phase = (
      window as typeof window & {
        __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } }
      }
    ).__STORYBOOK_PREVIEW__?.currentRender?.phase
    return ['completing', 'completed', 'errored', 'aborted'].includes(
      phase ?? '',
    )
  })
  if (await page.locator('.sb-show-errordisplay').count())
    throw new Error(
      `The story errored: ${await page.locator('#error-message').innerText()}`,
    )
}

/** Asks the page until it says yes, with node's clock: the page's is
 * stopped. */
async function until(page: Page, condition: () => boolean, limit = 60_000) {
  const end = Date.now() + limit
  while (!(await page.evaluate(condition))) {
    if (Date.now() > end)
      throw new Error(`The story did not load in ${limit}ms`)
    await new Promise((ready) => setTimeout(ready, 100))
  }
}

/** Checks the id in Storybook's `index.json` before opening the browser; a
 * wrong id comes out with the similar ones. */
async function checkId(options: StoryOptions) {
  const address = `${options.base}/index.json`
  const response = await fetch(address).catch(() => null)
  if (!response?.ok)
    throw new Error(
      `No Storybook at ${options.base}: start one with \`pnpm storybook\` or pass --port.`,
    )
  const ids = indexIds(await response.json())
  if (ids.includes(options.story)) return
  const similar = similarIds(options.story, ids)
  throw new Error(
    similar.length > 0
      ? `No story "${options.story}" at ${address}. Similar:\n${similar.map((id) => `  ${id}`).join('\n')}`
      : `No story "${options.story}" at ${address}, nor a similar one.`,
  )
}

if (import.meta.main) {
  const argv = process.argv.slice(2)
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(USAGE)
    process.exit(0)
  }
  const options = readArguments(argv, {
    out: join(tmpdir(), 'captures'),
    app: `http://localhost:${portaPedida('start')}`,
    storybook: `http://localhost:${portaPedida('storybook')}`,
  })
  if ('error' in options) {
    console.error(`${options.error}\n\n${USAGE}`)
    process.exit(2)
  }
  try {
    const written =
      'story' in options ? await captureStory(options) : await capture(options)
    for (const file of written) console.log(file)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
