// The Guide's reading bar (#195): a sticky line at the top with the Chapter
// being read ("2 de 5 · <title>") and a progress line under it that inks in
// as the reader goes, dotted where it is still to read. Tapping the line
// opens the Chapters to jump. On the phone the line slides away while the
// reader scrolls down and comes back on the way up; the progress line stays.
//
// The same piece keeps where the reader is (`state/reading.ts`): the Chapter
// and the paragraph at the top of the screen, saved once the scroll stops
// and when the page is hidden, and "O que levar" reached as the Guide read.
// Arriving from the home page's "continuar" (`resume` in the history entry),
// it takes the reader back to that paragraph.
//
// It reads the page only on a scroll frame (a passive listener and one
// `requestAnimationFrame`): a few positions read, then one write of the
// line's length, a CSS variable, without a React render. Without JavaScript
// it does not exist: the Chapter list under the title is enough.
import { useRouter } from '@tanstack/react-router'
import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { cn } from '@/platform/cn'
import {
  finishReading,
  matchParagraph,
  paragraphText,
  readingPlace,
  saveReadingPlace,
} from '#/state/reading'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/shadcn/collapsible'
import { ChapterLinks } from './guide-sections'
import { FoldArrow, useInBrowser } from './navigation'
import { CHAPTER, chapterOf } from './reading-progress.copy'

declare module '@tanstack/react-router' {
  interface HistoryState {
    /** Came from "continuar": go to the saved paragraph. */
    resume?: boolean
  }
}

/** The Guide's Chapters, as the bar needs them. */
type Chapters = ReadonlyArray<{ readonly id: string; readonly title: string }>

/** The line, from the top, at this share of the screen's height: the
 * Chapter whose title passed it is the one being read, and "O que levar"
 * passing it finishes the Guide. */
const READING_LINE = 0.4
/** Space between the bar and what a jump brings to the top (DESIGN.md: the
 * 16px scroll padding). */
const GAP = 16
/** How long the scroll stays still before the place is saved. */
const SAVE_AFTER_MS = 400
/** A smaller scroll does not hide or show the line: a finger resting on the
 * screen moves it a little. */
const SCROLL_NOISE = 6

/** What counts as a paragraph of a Chapter, to find it again. */
const PARAGRAPHS = ':is(p, li, h3, figure, blockquote, table)'

/** The Chapter's paragraphs with text, each counted once: a `p` inside an
 * `li` or a `blockquote` goes with it. */
const paragraphsOf = (chapter: Element) =>
  [...chapter.querySelectorAll<HTMLElement>(PARAGRAPHS)].filter((p) => {
    const outer = p.parentElement?.closest(PARAGRAPHS)
    return (
      !(outer && chapter.contains(outer)) &&
      paragraphText(p.textContent ?? '') !== ''
    )
  })

/** The first paragraph of the Chapter still showing under the bar. */
function topParagraph(chapter: Element, barBottom: number) {
  const paragraphs = paragraphsOf(chapter)
  const index = paragraphs.findIndex(
    (p) => p.getBoundingClientRect().bottom > barBottom,
  )
  if (index === -1) return null
  return { index, text: paragraphText(paragraphs[index]!.textContent ?? '') }
}

const clamp = (n: number) => Math.min(1, Math.max(0, n))

/** The bar, only in the browser: the server and the hydration draw
 * nothing. */
export function ReadingProgress({
  topic,
  chapters,
}: {
  topic: string
  chapters: Chapters
}) {
  const inBrowser = useInBrowser()
  if (!inBrowser || chapters.length === 0) return null
  return <ReadingBar topic={topic} chapters={chapters} />
}

/** Where the scroll left the reader: the Chapter whose title passed the
 * reading line (-1 above the first), how much of the Guide is behind the
 * line, and whether "O que levar" (or, without it, the Chapters' end)
 * passed it. Only reads the page; `null` with no layout to read (a page
 * still without styles). */
function readPosition(box: Element, sections: ReadonlyArray<Element>) {
  const area = box.getBoundingClientRect()
  if (area.height === 0) return null
  const line = innerHeight * READING_LINE
  let current = -1
  // The sections are in page order: the last one whose title passed.
  for (const [i, section] of sections.entries())
    if (section.getBoundingClientRect().top <= line) current = i
  const end =
    document.getElementById('o-que-levar')?.getBoundingClientRect().top ??
    area.bottom
  return {
    current,
    progress: clamp((line - area.top) / (end - area.top)),
    finished: end <= line,
  }
}

/** Slides the line away on the way down and back on the way up, unless the
 * Chapter list is open; returns the scroll it compared against. */
function slideLine(element: HTMLElement, lastY: number) {
  const y = scrollY
  if (Math.abs(y - lastY) <= SCROLL_NOISE) return lastY
  if (!element.hasAttribute('data-open'))
    element.dataset['line'] = y > lastY ? 'hidden' : 'shown'
  return y
}

/** The page's pieces the bar follows, or `null` while they are not there. */
function pagePieces(chapters: Chapters) {
  const box = document.querySelector('main [data-slot="capitulos-texto"]')
  const sections = chapters.map((c) => document.getElementById(c.id))
  if (!box || sections.some((s) => s === null)) return null
  return { box, sections: sections as HTMLElement[] }
}

/** Saves the Chapter at `at`, the paragraph at the top under the bar
 * (`rule`, the bar's bottom edge) and how much was read. */
function savePlace(
  topic: string,
  chapters: Chapters,
  sections: ReadonlyArray<Element>,
  at: NonNullable<ReturnType<typeof readPosition>>,
  rule: Element | null,
) {
  const chapter = chapters[at.current]
  const section = sections[at.current]
  if (!chapter || !section) return
  saveReadingPlace(topic, {
    chapter: chapter.id,
    chapterTitle: chapter.title,
    chapterNumber: at.current + 1,
    chapters: chapters.length,
    paragraph: topParagraph(section, rule?.getBoundingClientRect().bottom ?? 0),
    progress: Math.round(at.progress * 100) / 100,
    at: Date.now(),
  })
}

/** Listens to the window's scroll and size (`onMove`) and to the page
 * leaving or hiding (`onLeave`); returns what stops it. */
function listenToPage(onMove: () => void, onLeave: () => void) {
  const onHidden = () => {
    if (document.visibilityState === 'hidden') onLeave()
  }
  addEventListener('scroll', onMove, { passive: true })
  addEventListener('resize', onMove, { passive: true })
  addEventListener('pagehide', onLeave)
  document.addEventListener('visibilitychange', onHidden)
  return () => {
    removeEventListener('scroll', onMove)
    removeEventListener('resize', onMove)
    removeEventListener('pagehide', onLeave)
    document.removeEventListener('visibilitychange', onHidden)
  }
}

/** Follows the scroll: the Chapter being read (`onChapter`), the progress
 * line, the line hiding on the way down, and the place saved. */
function useFollowReading(
  topic: string,
  chapters: Chapters,
  bar: RefObject<HTMLDivElement | null>,
  rule: RefObject<HTMLSpanElement | null>,
  onChapter: (index: number | null) => void,
) {
  // A layout effect, so its cleanup runs with the page still in place: the
  // last place is saved before the Guide leaves.
  useLayoutEffect(() => {
    const element = bar.current
    const pieces = pagePieces(chapters)
    if (!element || !pieces) return
    const { box, sections } = pieces
    // The anchors land under the bar, not behind it.
    document.documentElement.style.scrollPaddingTop = `${element.offsetHeight + GAP}px`
    element.style.setProperty('--leitura', '0')
    let frame = 0
    let pending: ReturnType<typeof setTimeout> | undefined
    let lastY = scrollY
    let at = { current: -1, progress: 0, finished: false }
    const save = () => {
      clearTimeout(pending)
      pending = undefined
      savePlace(topic, chapters, sections, at, rule.current)
    }
    const measure = () => {
      frame = 0
      const now = readPosition(box, sections)
      if (!now) return
      at = now
      element.style.setProperty('--leitura', String(at.progress))
      lastY = slideLine(element, lastY)
      onChapter(at.current === -1 ? null : at.current)
      if (at.finished) finishReading(topic)
      else if (at.current !== -1) {
        clearTimeout(pending)
        pending = setTimeout(save, SAVE_AFTER_MS)
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    // Leaving or hiding the page saves what is still waiting.
    const flush = () => {
      if (pending) save()
    }
    const stop = listenToPage(onScroll, flush)
    onScroll()
    return () => {
      stop()
      cancelAnimationFrame(frame)
      flush()
      document.documentElement.style.scrollPaddingTop = ''
    }
  }, [topic, chapters, bar, rule, onChapter])
}

/** What ends the wait for the router's scroll: the reader's own hand. */
const READER_INPUT = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

/** Arriving from "continuar": the saved paragraph goes to the top, under
 * the bar, or the Chapter's start if the paragraph is gone. */
function useResume(topic: string, bar: RefObject<HTMLDivElement | null>) {
  const router = useRouter()
  useEffect(() => {
    // The router's entry, read once on arrival.
    if (!router.state.location.state.resume) return
    const place = readingPlace(topic)
    const chapter = place && document.getElementById(place.chapter)
    if (!place || !chapter) return
    const paragraphs = paragraphsOf(chapter)
    const index = place.paragraph
      ? matchParagraph(
          place.paragraph,
          paragraphs.map((p) => p.textContent ?? ''),
        )
      : null
    const target = index === null ? chapter : paragraphs[index]!
    const jump = () => {
      const offset = (bar.current?.offsetHeight ?? 0) + GAP
      window.scrollTo({
        top: target.getBoundingClientRect().top + scrollY - offset,
        behavior: 'instant',
      })
    }
    // On the next frame, with the page laid out. The router puts a new page
    // at the top when it finishes drawing it, which may come after that
    // frame: each time it does, until the reader moves, the jump follows.
    const frame = requestAnimationFrame(() => {
      jump()
      // The browser's entry loses the mark: a reload or a Back to it keeps
      // its own scroll and does not jump again.
      const { resume: _done, ...state } = window.history.state ?? {}
      window.history.replaceState(state, '')
    })
    const unsubscribe = router.subscribe('onRendered', jump)
    const stop = () => {
      unsubscribe()
      for (const input of READER_INPUT) removeEventListener(input, stop)
    }
    for (const input of READER_INPUT)
      addEventListener(input, stop, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      stop()
    }
  }, [topic, bar, router])
}

/** The bar's line: "2 de 5 · <title>" and the arrow of the list. */
function CurrentChapter({
  n,
  total,
  title,
}: {
  n: number
  total: number
  title: string
}) {
  return (
    <>
      <span className="sr-only">{CHAPTER}</span>{' '}
      <span className="shrink-0">{chapterOf(n, total)}</span>
      {/* The spaces keep the words apart for a screen reader; the flex row
          does not draw them. */}{' '}
      <span className="text-tinta-2" aria-hidden="true">
        ·
      </span>{' '}
      <span className="min-w-0 flex-1 truncate">{title}</span>
      <FoldArrow className="rotate-90 group-data-panel-open:-rotate-90" />
    </>
  )
}

/** The bar. The open Chapter list keeps the line in view, also on the
 * phone. */
function ReadingBar({
  topic,
  chapters,
}: {
  topic: string
  chapters: Chapters
}) {
  const bar = useRef<HTMLDivElement>(null)
  const rule = useRef<HTMLSpanElement>(null)
  const [current, setCurrent] = useState<number | null>(null)
  const [open, setOpenState] = useState(false)
  const setOpen = (next: boolean) => {
    setOpenState(next)
    if (next && bar.current) bar.current.dataset['line'] = 'shown'
  }
  useFollowReading(topic, chapters, bar, rule, setCurrent)
  useResume(topic, bar)
  const chapter = current === null ? null : chapters[current]
  return (
    <div
      className="sticky top-0 z-10 -mx-md h-0 folha:-mx-16"
      data-slot="leitura"
    >
      <div
        ref={bar}
        data-state={chapter ? 'reading' : 'before'}
        data-open={open ? '' : undefined}
        className="relative bg-papel px-md transition-[translate,opacity,visibility] duration-250 ease-sai data-[line=hidden]:-translate-y-full data-[state=before]:invisible data-[state=before]:-translate-y-full data-[state=before]:opacity-0 motion-reduce:transition-none folha:px-16 folha:data-[line=hidden]:translate-y-0"
      >
        <Collapsible
          variant="bar"
          open={open}
          onOpenChange={setOpen}
          onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
        >
          <CollapsibleTrigger variant="bar">
            {chapter && (
              <CurrentChapter
                n={current! + 1}
                total={chapters.length}
                title={chapter.title}
              />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mb-sm">
            <ChapterLinks
              chapters={chapters}
              current={current ?? undefined}
              onPick={() => setOpen(false)}
            />
          </CollapsibleContent>
        </Collapsible>
        <ProgressLine
          ref={rule}
          className="absolute inset-x-0 top-full bg-papel"
        />
      </div>
    </div>
  )
}

/** The progress line: dotted where it is still to read, inked up to the
 * share in the `--leitura` variable (0 to 1) of an ancestor. The bar moves
 * it on scroll; the home page's item sets it once. */
export function ProgressLine({
  ref,
  className,
}: {
  ref?: RefObject<HTMLSpanElement | null>
  className?: string
}) {
  // Spans, so the line also fits inside a link.
  return (
    <span
      ref={ref}
      className={cn('relative block h-1', className)}
      data-slot="progresso"
      aria-hidden="true"
    >
      <span className="block border-t-2 fio-pontilhado border-tinta" />
      <span className="absolute inset-x-0 top-0 h-0.75 origin-left scale-x-(--leitura) bg-tinta" />
    </span>
  )
}
