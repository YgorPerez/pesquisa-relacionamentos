// "Continuar lendo", at the top of the home page (#195): one item per Guide
// started and not finished, the most recent first, each with its Chapter,
// how much was read and the × that forgets it. The item leads back to the
// paragraph where the reader stopped (`resume`, read by the Guide's reading
// bar). It only exists in the browser that holds the reading
// (`state/reading.ts`); the page passes the items.
import { Link } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
import { countEvent } from '#/analytics/counting'
import { EVENTS } from '#/analytics/events'
import type { ReadingPlace } from '#/state/reading'
import { Button } from '@/ui/shadcn/button'
import { ForwardArrow } from './navigation'
import { ProgressLine } from './reading-progress'
import { CHAPTER, chapterOf } from './reading-progress.copy'
import { Headline, Panel, Section } from './section'
import { CONTINUE_READING, forget, readShare } from './continue-reading.copy'

export interface ReadingItem {
  readonly topic: string
  /** The Guide's title today, from the content. */
  readonly title: string
  readonly place: ReadingPlace
}

const Cross = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M3 3.4c3.4 3 6.4 6.1 9.8 9.4M12.7 3.1C9.6 6.4 6.6 9.6 3.3 12.9" />
  </svg>
)

/** The item's way back into the Guide: its name, the Chapter and how much
 * was read. */
function ResumeLink({ topic, title, place }: ReadingItem) {
  return (
    <Link
      to="/$tema"
      params={{ tema: topic }}
      state={{ resume: true }}
      onClick={() => countEvent(EVENTS.continueReading(topic))}
      className="group block min-w-0 flex-1 py-2.5 no-underline"
      style={{ '--leitura': place.progress } as CSSProperties}
    >
      <span className="flex items-center gap-2 font-title text-title decoration-2 underline-offset-4 group-hover:underline">
        {title}
        <ForwardArrow />
      </span>
      <span className="mt-0.5 block text-nota leading-nota text-tinta-2">
        {CHAPTER} {chapterOf(place.chapterNumber, place.chapters)} ·{' '}
        {place.chapterTitle}
      </span>
      <span className="mt-1.5 flex items-center gap-2.5">
        <ProgressLine className="flex-1" />
        <span className="flex-none text-nota leading-nota text-tinta-2">
          {readShare(place.progress)}
        </span>
      </span>
    </Link>
  )
}

export function ContinueReading({
  items,
  onForget,
}: {
  items: ReadonlyArray<ReadingItem>
  onForget: (topic: string) => void
}) {
  if (items.length === 0) return null
  return (
    <Section aria-labelledby="continuar-lendo">
      <Headline id="continuar-lendo">{CONTINUE_READING}</Headline>
      <Panel className="py-1.5">
        <ul className="m-0 list-none p-0" data-slot="leituras">
          {items.map(({ topic, title, place }) => (
            <li
              key={topic}
              className="flex items-start gap-2 not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
            >
              <ResumeLink topic={topic} title={title} place={place} />
              <Button
                variant="icon"
                aria-label={forget(title)}
                onClick={() => onForget(topic)}
                className="mt-1"
              >
                <Cross />
              </Button>
            </li>
          ))}
        </ul>
      </Panel>
    </Section>
  )
}
