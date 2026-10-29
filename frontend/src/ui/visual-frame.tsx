// What the four Visuals share: the figure with its title, the margin note
// with the hand-drawn arrow, the own-calculation lines, the Fact sheets'
// rings and the list rows (DESIGN.md: the scale is exact, the hand only
// marks, points and notes). A highlighted value takes the key number's pink
// marker, `.numero-chave` of `drawings.css`.
import type { ReactNode } from 'react'
import type { SourceRef } from '#/content/visuals-view'
import { VISUAL_COPY } from './visual.copy'

/** The references in their rings, the same `.ref` as the text's: they open
 * the Fact sheet's popover (`reference-popover.tsx`), and without JS lead to
 * it in the page's list. `glued` goes right before them, and
 * `after` is a text whose last word does: either keeps the rings off the
 * start of a line (The Glued Ref Rule). */
export function SourceRefs({
  sources,
  glued,
  after = '',
}: {
  sources: ReadonlyArray<SourceRef>
  glued?: ReactNode
  after?: string
}) {
  const lastWord = /\S+$/.exec(after)?.[0] ?? ''
  return (
    <>
      {after.slice(0, after.length - lastWord.length)}
      <span className="nw">
        {glued}
        {lastWord}
        <Rings sources={sources} />
      </span>
    </>
  )
}

function Rings({ sources }: { sources: ReadonlyArray<SourceRef> }) {
  return (
    <>
      {sources.map((s) => (
        <a
          key={s.anchor}
          className="ref"
          href={`#${s.anchor}`}
          aria-label={`Ficha ${s.n}: ${s.title}`}
        >
          {s.n}
        </a>
      ))}
    </>
  )
}

/** A row of the list under a time line or a diagram, which carries the
 * words a screen reader reads. */
export function VisualListItem({ children }: { children: ReactNode }) {
  return (
    <li className="border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta py-1.5 first:border-t-0">
      {children}
    </li>
  )
}

/** The "conta nossa" tag next to a number we computed. */
export function OwnTag() {
  return (
    <span className="font-body text-nota leading-nota font-normal text-tinta-2 italic">
      {VISUAL_COPY.own}
    </span>
  )
}

export function VisualFrame({
  domId,
  title,
  note,
  ownLines = [],
  sources = [],
  children,
}: {
  /** The figure's id on the page, unique among every Question's Visuals. */
  domId: string
  title: string
  note: string | null
  ownLines?: ReadonlyArray<string>
  /** The "Fontes:" line; none when each row already cites its own. */
  sources?: ReadonlyArray<SourceRef>
  children: ReactNode
}) {
  const titleId = `${domId}-titulo`
  return (
    // While one of its rings is tapped, under the pointer or focused, the
    // figure is what it cites (`reference-popover.tsx`).
    <figure
      id={domId}
      className="mx-0 my-lg rounded-mao-2 data-citado:bg-agua-fonte/30 data-citado:outline-2 data-citado:outline-offset-4 data-citado:outline-agua-tinta"
      data-slot="visual"
      aria-labelledby={titleId}
    >
      <figcaption
        id={titleId}
        className="m-0 mb-sm font-title text-title text-balance"
      >
        {title}
      </figcaption>
      {children}
      {note && (
        <p className="m-0 mt-xs flex items-start gap-1.5 font-body text-nota leading-nota text-agua-tinta italic">
          <svg
            width="30"
            height="26"
            viewBox="0 0 30 26"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="flex-none"
          >
            <path d="M26 22C18 21 9 16 6 4M6 4l-3 7M6 4l6 5" />
          </svg>
          <span className="pt-2">{note}</span>
        </p>
      )}
      {(ownLines.length > 0 || sources.length > 0) && (
        <div className="mt-xs text-nota leading-nota text-tinta-2 [&_p]:m-0">
          {ownLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {sources.length > 0 && (
            <p>
              <SourceRefs sources={sources} glued={VISUAL_COPY.sources} />
            </p>
          )}
        </div>
      )}
    </figure>
  )
}
