// The share image (#302), drawn in the browser on a canvas: no server and no
// dependency. It sets the Possible group as a question and its answer, in
// the site's zine (DESIGN.md): cool paper, ink, the title's one yellow word,
// the pink highlighter on the key number, the panel with the halftone behind
// it and the hand-drawn rule. The text comes from `groupImage`
// (`@tem-estudo/rules/link`), which reads only what the link carries.
import type { GroupImage } from '@tem-estudo/rules/link'
import { BRAND_COLORS } from './brand'

/** The two formats: the square post and the 9:16 story. */
export type ImageFormat = 'square' | 'story'

export const IMAGE_SIZE: Readonly<
  Record<ImageFormat, { readonly width: number; readonly height: number }>
> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
}

const INK = BRAND_COLORS.tinta
const INK_2 = BRAND_COLORS['tinta-2']
const PINK = BRAND_COLORS['rosa-mito']
const YELLOW = BRAND_COLORS['amarelo-voce']

const DISPLAY = 'Bricolage Grotesque, Atkinson Hyperlegible, sans-serif'
const BODY = 'Atkinson Hyperlegible, sans-serif'

/** The address the image points to: the page, never the link's query. */
const ADDRESS = 'temestudo.cloud/grupo-possivel'

/** The highlighter's hand shape (`.numero-chave` and `.marca-texto` in
 * `drawings.css`), on a 200 × 40 box. */
const HIGHLIGHTER =
  'M4 8C50 6 130 7 196 5l1 8-1 9 1 9-3 3C130 33 60 33 5 35l-2-8 1-9-1-8z'
/** The section's hand-drawn rule (`regua`), on a 600 × 6 box. */
const RULE = 'M1 3.4C120 2.6 260 3.6 380 2.9S540 3.3 599 2.8'

type Mark = 'pink' | 'yellow' | null

/** A piece of text with its look: a word in the highlighter, a bold value. */
interface Run {
  readonly text: string
  readonly mark?: Mark
  readonly bold?: boolean
}

interface Style {
  readonly family: string
  readonly size: number
  readonly weight: number
  readonly bold?: number
  readonly lineHeight: number
  readonly tracking?: number
  readonly color: string
}

interface Word {
  readonly text: string
  readonly mark: Mark
  readonly bold: boolean
}

type Line = ReadonlyArray<Word & { readonly width: number }>

/** Each format's measures: the margins keep the text off the edges, and in
 * the story off the bands the app covers (about 250px at the top and 340px
 * at the bottom). */
const FRAME: Readonly<
  Record<
    ImageFormat,
    {
      readonly side: number
      readonly top: number
      readonly bottom: number
      readonly question: number
      readonly answer: readonly [max: number, min: number]
      readonly also: number
      readonly gap: number
    }
  >
> = {
  square: {
    side: 84,
    top: 84,
    bottom: 84,
    question: 52,
    answer: [92, 54],
    also: 31,
    gap: 52,
  },
  story: {
    side: 84,
    top: 260,
    bottom: 360,
    question: 64,
    answer: [112, 62],
    also: 36,
    gap: 72,
  },
}

const font = (s: Style, bold = false) =>
  `${bold ? (s.bold ?? 700) : s.weight} ${s.size}px ${s.family}`

/** The words of the runs, each keeping its run's look. */
const words = (runs: ReadonlyArray<Run>): Word[] =>
  runs.flatMap((r) =>
    r.text
      .split(/\s+/)
      .filter(Boolean)
      .map((text) => ({ text, mark: r.mark ?? null, bold: r.bold ?? false })),
  )

/** The runs broken into lines no wider than `width`. */
function wrap(
  ctx: CanvasRenderingContext2D,
  runs: ReadonlyArray<Run>,
  style: Style,
  width: number,
): Line[] {
  const lines: Array<Array<Word & { width: number }>> = [[]]
  const space = measure(ctx, ' ', style, false)
  let used = 0
  for (const word of words(runs)) {
    const w = measure(ctx, word.text, style, word.bold)
    const line = lines.at(-1)!
    if (line.length > 0 && used + space + w > width) {
      lines.push([{ ...word, width: w }])
      used = w
    } else {
      used += (line.length > 0 ? space : 0) + w
      line.push({ ...word, width: w })
    }
  }
  return lines
}

function measure(
  ctx: CanvasRenderingContext2D,
  text: string,
  style: Style,
  bold: boolean,
): number {
  ctx.font = font(style, bold)
  ctx.letterSpacing = `${style.tracking ?? 0}px`
  return ctx.measureText(text).width
}

/** Draws the lines from `top`, with the highlighter behind each marked
 * stretch, covering the whole letter (The Full Letter Rule). Returns the
 * height drawn. */
function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: ReadonlyArray<Line>,
  style: Style,
  left: number,
  top: number,
): number {
  const step = style.size * style.lineHeight
  const space = measure(ctx, ' ', style, false)
  lines.forEach((line, i) => {
    const baseline = top + i * step + style.size * 0.8
    // The highlighter first, one band per stretch of marked words.
    let x = left
    const stretches: Array<{ mark: Mark; from: number; to: number }> = []
    line.forEach((word, j) => {
      const last = stretches.at(-1)
      if (word.mark && j > 0 && line[j - 1]!.mark === word.mark && last)
        last.to = x + word.width
      else if (word.mark)
        stretches.push({ mark: word.mark, from: x, to: x + word.width })
      x += word.width + space
    })
    const bleed = style.size * 0.12
    for (const { mark, from, to } of stretches)
      highlight(
        ctx,
        mark === 'pink' ? PINK : YELLOW,
        from - bleed,
        baseline - style.size * 0.86,
        to - from + bleed * 2,
        style.size * 1.12,
      )
    x = left
    for (const word of line) {
      ctx.font = font(style, word.bold)
      ctx.letterSpacing = `${style.tracking ?? 0}px`
      ctx.fillStyle = word.bold ? INK : style.color
      ctx.fillText(word.text, x, baseline)
      x += word.width + space
    }
  })
  return lines.length * step
}

function highlight(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((-0.5 * Math.PI) / 180)
  ctx.scale(width / 200, height / 40)
  ctx.fillStyle = color
  ctx.fill(new Path2D(HIGHLIGHTER))
  ctx.restore()
}

function rule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(w / 600, 1.6)
  ctx.strokeStyle = INK
  ctx.lineWidth = 2.6
  ctx.lineCap = 'round'
  ctx.stroke(new Path2D(RULE))
  ctx.restore()
}

/** The hand radii (`mao`), at the image's scale. */
const PANEL_RADII = [18, 8, 16, 10]

/** The panel: folha with a 5px ink outline and, behind it, the fine
 * halftone offset to the right and down (The Halftone Rule). */
function panel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const dots = document.createElement('canvas')
  dots.width = dots.height = 10
  const d = dots.getContext('2d')
  if (d) {
    d.globalAlpha = 0.62
    d.fillStyle = INK
    d.beginPath()
    d.arc(5, 5, 2.1, 0, Math.PI * 2)
    d.fill()
    const pattern = ctx.createPattern(dots, 'repeat')
    if (pattern) {
      ctx.fillStyle = pattern
      ctx.beginPath()
      ctx.roundRect(x + 13, y + 16, w, h, PANEL_RADII)
      ctx.fill()
    }
  }
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, PANEL_RADII)
  ctx.fillStyle = BRAND_COLORS.folha
  ctx.fill()
  ctx.lineWidth = 5
  ctx.strokeStyle = INK
  ctx.stroke()
}

/** The dashed "instável" tag, as on the page. */
function unstableTag(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const style: Style = {
    family: BODY,
    size: 30,
    weight: 700,
    lineHeight: 1,
    color: INK,
  }
  const w = measure(ctx, 'instável', style, false) + 36
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, w, 52, [8, 16, 10, 14])
  ctx.setLineDash([10, 7])
  ctx.lineWidth = 4
  ctx.strokeStyle = INK
  ctx.stroke()
  ctx.restore()
  ctx.font = font(style)
  ctx.fillStyle = INK
  ctx.fillText('instável', x + 18, y + 36)
}

/** The fonts the image uses, loaded before drawing: a canvas does not wait
 * for a web font, and would draw in the fallback. */
export async function loadImageFonts() {
  // jsdom has no `document.fonts`.
  if (!('fonts' in document)) return
  await Promise.all(
    [
      `700 92px ${DISPLAY}`,
      `600 52px ${DISPLAY}`,
      `400 31px ${BODY}`,
      `700 31px ${BODY}`,
    ].map((f) => document.fonts.load(f, 'Entre 0123456789 éã')),
  )
}

/** Draws `image` in `format` on `canvas`, at the format's size. */
export function drawGroupImage(
  canvas: HTMLCanvasElement,
  image: GroupImage,
  format: ImageFormat,
) {
  const { width, height } = IMAGE_SIZE[format]
  const frame = FRAME[format]
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2D canvas.')
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = BRAND_COLORS.papel
  ctx.fillRect(0, 0, width, height)

  const inner = width - frame.side * 2
  const pad = format === 'story' ? 56 : 48

  const question: Style = {
    family: DISPLAY,
    size: frame.question,
    weight: 700,
    lineHeight: 1.08,
    tracking: -frame.question * 0.022,
    color: INK,
  }
  const questionLines = wrap(
    ctx,
    [
      { text: 'Quantas pessoas atendem ao que eu' },
      { text: 'procuro?', mark: 'yellow' },
    ],
    question,
    inner,
  )

  // The answer shrinks until it and the Requirements fit the frame.
  const alsoStyle: Style = {
    family: BODY,
    size: frame.also,
    weight: 400,
    lineHeight: 1.4,
    color: INK_2,
  }
  const alsoRuns: Run[] =
    image.also.length > 0
      ? [
          { text: 'Também pedi:' },
          ...image.also.map((value, i) => ({
            text: `${value}${i === image.also.length - 1 ? '.' : ','}`,
            bold: true,
          })),
        ]
      : [{ text: 'Sem outros Requisitos.' }]
  const alsoLines = wrap(ctx, alsoRuns, alsoStyle, inner - pad * 2)
  const alsoHeight = alsoLines.length * alsoStyle.size * alsoStyle.lineHeight
  const tag = image.unstable ? 52 + 24 : 0

  const footer = format === 'story' ? 150 : 120
  const questionHeight =
    questionLines.length * question.size * question.lineHeight
  const room =
    height -
    frame.top -
    frame.bottom -
    questionHeight -
    frame.gap -
    footer -
    pad * 2 -
    alsoHeight -
    tag -
    36

  const answerRuns: Run[] = [
    { text: image.before },
    { text: image.numbers, mark: 'pink' },
    { text: image.who },
  ]
  let answer: Style = answerStyle(frame.answer[0])
  let answerLines = wrap(ctx, answerRuns, answer, inner - pad * 2)
  for (
    let size = frame.answer[0];
    size > frame.answer[1] &&
    answerLines.length * answer.size * answer.lineHeight > room;
    size -= 2
  ) {
    answer = answerStyle(size)
    answerLines = wrap(ctx, answerRuns, answer, inner - pad * 2)
  }
  const answerHeight = answerLines.length * answer.size * answer.lineHeight

  // The question and the panel sit in the middle of the band above the
  // signature.
  const panelHeight = pad * 2 + answerHeight + 36 + alsoHeight + tag
  const content = questionHeight + frame.gap + panelHeight + footer
  let y =
    frame.top + Math.max(0, (height - frame.top - frame.bottom - content) / 2)

  y += drawLines(ctx, questionLines, question, frame.side, y)
  y += frame.gap

  panel(ctx, frame.side, y, inner, panelHeight)
  let inside = y + pad
  inside += drawLines(ctx, answerLines, answer, frame.side + pad, inside)
  if (image.unstable) {
    unstableTag(ctx, frame.side + pad, inside + 18)
    inside += tag
  }
  inside += 36
  drawLines(ctx, alsoLines, alsoStyle, frame.side + pad, inside)

  // The signature: the rule, the site's name, the address and the sources.
  const base = height - frame.bottom
  rule(ctx, frame.side, base - 96, inner)
  ctx.letterSpacing = '-0.6px'
  ctx.font = `700 40px ${DISPLAY}`
  ctx.fillStyle = INK
  ctx.fillText('Tem estudo?', frame.side, base - 36)
  ctx.letterSpacing = '0px'
  ctx.font = `700 28px ${BODY}`
  ctx.textAlign = 'right'
  ctx.fillText(ADDRESS, width - frame.side, base - 50)
  ctx.font = `400 24px ${BODY}`
  ctx.fillStyle = INK_2
  ctx.fillText('Censo 2022 e PNS 2019', width - frame.side, base - 14)
  ctx.textAlign = 'left'
}

function answerStyle(size: number): Style {
  return {
    family: DISPLAY,
    size,
    weight: 700,
    lineHeight: 1.12,
    tracking: -size * 0.022,
    color: INK,
  }
}

/** The image as a PNG. */
export function imageBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No PNG.'))),
      'image/png',
    ),
  )
}
