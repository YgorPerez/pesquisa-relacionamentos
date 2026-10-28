// The Grifos section of "Seus trechos" (`/trechos`, #335, #347): every Grifo
// saved in this browser, one group
// per page, Guides first, then Tips, then Fact sheets, as the search orders
// them. Each Grifo shows its quote, which leads to its sentence, its Nota and
// its "Tirar grifo". A Grifo whose quote left its page (`changed`, set by
// that page's layer) says so and keeps its quote and Nota. Everything comes
// from the store (`state/highlights.ts`); the page never reads a Guide.
//
// The quote is a plain `<a>`, not the router's `Link`, for the search's
// reason: the browser only reads the Text Fragment (`#…:~:text=`) when it
// loads a page.
import type { SearchKind } from '#/content/site-search-view'
import type { Highlight } from '#/state/highlight-record'
import type { ComponentProps } from 'react'
import { Button } from '@/ui/shadcn/button'
import { REMOVE_HIGHLIGHT } from './highlight.copy'
import { HighlightNote } from './highlight-note'
import {
  CHANGED,
  CHANGED_LINE,
  EMPTY_LINE,
  HIGHLIGHTS,
  removeLabel,
  saved,
} from './highlight-list.copy'
import { Headline, Notice, Section, Tag } from './section'
import { KIND_TAG } from './site-search.copy'

interface PageGroup {
  readonly path: string
  readonly title: string
  readonly kind: SearchKind
  readonly highlights: ReadonlyArray<Highlight>
}

/** A list entry separated from the previous page group or comment. */
export function SeparatedListItem(props: ComponentProps<'li'>) {
  return (
    <li
      {...props}
      className="not-first:mt-lg not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta not-first:pt-md"
    />
  )
}

/** Keeps the old quote visible when it no longer matches its page. */
export function ChangedPassageNotice({ children }: { children: string }) {
  return (
    <Notice className="mb-xs">
      <strong className="block">{CHANGED}</strong>
      {children}
    </Notice>
  )
}

/** The kind of page at `path`, by the site's routes. */
const kindOf = (path: string): SearchKind =>
  path.startsWith('/dicas/')
    ? 'tip'
    : path.startsWith('/estudos/')
      ? 'fact-sheet'
      : 'guide'

const KIND_ORDER: ReadonlyArray<SearchKind> = ['guide', 'tip', 'fact-sheet']

/** The Grifos by page, each page's in the order they were made. The page's
 * title is the one its latest Grifo saw. */
function byPage(highlights: ReadonlyArray<Highlight>): PageGroup[] {
  const pages = new Map<string, Highlight[]>()
  for (const h of [...highlights].sort((a, b) => a.at - b.at))
    pages.set(h.path, [...(pages.get(h.path) ?? []), h])
  return [...pages]
    .map(([path, list]) => ({
      path,
      title: list.at(-1)!.pageTitle,
      kind: kindOf(path),
      highlights: list,
    }))
    .sort(
      (a, b) =>
        KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
        a.title.localeCompare(b.title, 'pt-BR'),
    )
}

/** The button under each item of "Seus trechos" that takes it off: "Tirar
 * grifo" here, "Tirar da lista" for a Comentário (`sent-comment-list.tsx`).
 * `label` names the item, since the list has one per item. */
export function RemoveButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: string
}) {
  return (
    <Button
      variant="light"
      className="mt-xs"
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

/** One Grifo: the notice if its passage changed, the quote, the Nota. */
function SavedHighlight({
  highlight,
  onRemove,
}: {
  highlight: Highlight
  onRemove: (id: string) => void
}) {
  const { id, link, text, note, changed } = highlight
  return (
    <li className="not-first:mt-md" data-slot="grifo-salvo">
      {changed && <ChangedPassageNotice>{CHANGED_LINE}</ChangedPassageNotice>}
      <a
        href={link}
        className="block whitespace-pre-line no-underline"
        data-slot="trecho"
      >
        <span className="grifo hover:decoration-2">{text}</span>
      </a>
      {note !== '' && (
        <HighlightNote
          note={note}
          className="mt-xs border-l-2 border-tinta pl-sm"
        />
      )}
      <RemoveButton label={removeLabel(text)} onClick={() => onRemove(id)}>
        {REMOVE_HIGHLIGHT}
      </RemoveButton>
    </li>
  )
}

/** The Grifos section, or what to do when there is none. */
export function HighlightList({
  highlights,
  onRemove,
}: {
  highlights: ReadonlyArray<Highlight>
  onRemove: (id: string) => void
}) {
  const groups = byPage(highlights)
  return (
    <Section id="grifos" aria-labelledby="t-grifos">
      <Headline id="t-grifos">{HIGHLIGHTS}</Headline>
      {groups.length === 0 ? (
        <p className="m-0">{EMPTY_LINE}</p>
      ) : (
        <>
          <p className="m-0 mb-md text-nota text-tinta-2">
            {saved(highlights.length, groups.length)}
          </p>
          <PageGroups groups={groups} onRemove={onRemove} />
        </>
      )}
    </Section>
  )
}

/** One group per page, under the page's kind and title. */
function PageGroups({
  groups,
  onRemove,
}: {
  groups: ReadonlyArray<PageGroup>
  onRemove: (id: string) => void
}) {
  return (
    <ol className="m-0 list-none p-0">
      {groups.map((group) => (
        <SeparatedListItem key={group.path} data-slot="pagina-grifada">
          <h3 className="m-0 mb-sm font-title text-title">
            <Tag className="mr-2 inline-block align-middle">
              {KIND_TAG[group.kind]}
            </Tag>
            <a href={group.path}>{group.title}</a>
          </h3>
          <ul className="m-0 list-none p-0">
            {group.highlights.map((h) => (
              <SavedHighlight key={h.id} highlight={h} onRemove={onRemove} />
            ))}
          </ul>
        </SeparatedListItem>
      ))}
    </ol>
  )
}
