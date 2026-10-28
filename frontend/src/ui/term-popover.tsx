// A Verbete's popover (#351; GLOSSARY: Verbete): a tap on a marked word opens
// its general definition and, under "Neste Estudo:", how each Study the
// sentence cites defined it, with the way to its entry in `/glossario`. The
// word is a link there (`content/terms-view.ts`), so without JS, or with a
// modifier key, the tap just follows it.
import { Popover } from '@base-ui/react/popover'
import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { scrollBehavior } from './loop'
import type { StudyDefinition, TermView } from '#/content/terms-view'
import { Html } from './html'
import { SmallLink } from './section'
import { PopoverLine, TextPopover } from './text-popover'
import { IN_STUDY, SEE_IN_GLOSSARY, termLabel } from './term-popover.copy'

/** The marked word on the page, by its server-side link. */
const TERM_LINK = 'a[data-verbete]'

interface Opened {
  readonly slug: string
  readonly range: Range
  /** The Fact sheets the word's sentence cites. */
  readonly factSheets: ReadonlyArray<string>
  /** Which of the page's marked words it is, for the way back. */
  readonly index: number
}

const termLinks = () => [...document.querySelectorAll(`main ${TERM_LINK}`)]

/** Back from the Glossário's "voltar ao texto" (#358): once the history has
 * put the reading point back, the word the reader left from comes to the
 * middle of the screen and takes the focus, as a reference ring does
 * (`navigation.tsx`). */
function useBackToTheWord() {
  // The entry already drawn, as `useReadingPointInHistory` reads it.
  const entry = useRouterState({
    select: (s) => s.resolvedLocation?.state.__TSR_key,
  })
  useEffect(() => {
    const state = window.history.state as {
      __TSR_key?: string
      verbeteOrigin?: number
    } | null
    if (!state || state.__TSR_key !== entry) return
    const { verbeteOrigin: index, ...rest } = state
    if (index === undefined) return
    window.history.replaceState(rest, '')
    // After the reading point's own frame, scheduled in a layout effect.
    const frame = requestAnimationFrame(() => {
      const word = termLinks()[index]
      if (!(word instanceof HTMLElement)) return
      word.scrollIntoView({ block: 'center', behavior: scrollBehavior() })
      word.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [entry])
}

/** How Studies defined the Verbete: each Fact sheet's title, leading to
 * it, and its definition. */
export function StudyDefinitions({
  definitions,
}: {
  definitions: ReadonlyArray<StudyDefinition>
}) {
  return (
    <ul className="m-0 mt-1 list-none p-0">
      {definitions.map((d) => (
        <li key={d.factSheet} className="not-first:mt-xs">
          <Link
            to="/estudos/$slug"
            params={{ slug: d.factSheet }}
            className="font-bold decoration-agua-tinta hover:bg-agua-fonte"
          >
            {d.title}
          </Link>
          : <Html as="span" html={d.html} />
        </li>
      ))}
    </ul>
  )
}

/** What the popover holds: the word, the general definition, the cited
 * Studies' definitions and the way to the Glossário. */
export function TermCard({
  term,
  factSheets,
  onLeave,
}: {
  term: TermView
  factSheets: ReadonlyArray<string>
  /** Before "Ver no Glossário" leaves the page. */
  onLeave?: () => void
}) {
  const cited = new Set(factSheets)
  const inStudy = term.definitions.filter((d) => cited.has(d.factSheet))
  return (
    <>
      <p className="m-0 font-label text-label font-bold">{term.name}</p>
      <Html as="p" className="m-0 mt-1" html={term.definitionHtml} />
      {inStudy.length > 0 && (
        <div className="mt-xs" data-slot="neste-estudo">
          <PopoverLine>
            {inStudy.length === 1 ? IN_STUDY.one : IN_STUDY.many}
          </PopoverLine>
          <StudyDefinitions definitions={inStudy} />
        </div>
      )}
      <SmallLink
        to="/glossario"
        hash={term.slug}
        state={{ fromText: true }}
        onClick={onLeave}
        className="mt-xs"
      >
        {SEE_IN_GLOSSARY}
      </SmallLink>
    </>
  )
}

/** Opens the Verbete under a tap. A tap with a modifier key, or on a
 * Verbete the page did not send, follows the link. */
function followTaps(
  terms: Readonly<Record<string, TermView>>,
  open: (opened: Opened) => void,
) {
  const onClick = (event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!(event.target instanceof Element)) return
    const link = event.target.closest(TERM_LINK)
    const slug = link?.getAttribute('data-verbete') ?? ''
    if (!link || !terms[slug]) return
    event.preventDefault()
    const range = document.createRange()
    range.selectNodeContents(link)
    const factSheets = (link.getAttribute('data-fichas') ?? '')
      .split(' ')
      .filter(Boolean)
    open({ slug, range, factSheets, index: termLinks().indexOf(link) })
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}

/** What a page with Verbetes mounts once, after its `<Column>`. */
export function TermPopover({
  terms,
}: {
  terms: Readonly<Record<string, TermView>>
}) {
  const [opened, setOpened] = useState<Opened | null>(null)
  useEffect(() => followTaps(terms, setOpened), [terms])
  useBackToTheWord()
  const term = opened && terms[opened.slug]
  if (!opened || !term) return null
  return (
    <Popover.Root
      open
      onOpenChange={(open) => {
        if (!open) setOpened(null)
      }}
    >
      <TextPopover
        range={opened.range}
        side="bottom"
        sideOffset={8}
        aria-label={termLabel(term.name)}
        data-slot="verbete"
      >
        <TermCard
          term={term}
          factSheets={opened.factSheets}
          // On the entry the page is leaving, next to its reading point.
          onLeave={() =>
            window.history.replaceState(
              { ...window.history.state, verbeteOrigin: opened.index },
              '',
            )
          }
        />
      </TextPopover>
    </Popover.Root>
  )
}
