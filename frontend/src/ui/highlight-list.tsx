// The list of `/grifos` (#335): every Grifo saved in this browser, one group
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
import type { Highlight } from '#/state/highlights'
import { SiteButton } from './button'
import { NOTE_HEADING, REMOVE_HIGHLIGHT } from './highlight.copy'
import {
  CHANGED,
  CHANGED_LINE,
  EMPTY_HEADING,
  EMPTY_LINE,
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
      {changed && (
        <Notice className="mb-xs">
          <strong className="block">{CHANGED}</strong>
          {CHANGED_LINE}
        </Notice>
      )}
      <a
        href={link}
        className="block whitespace-pre-line no-underline"
        data-slot="trecho"
      >
        <span className="underline decoration-tinta decoration-wavy underline-offset-4 hover:decoration-2">
          {text}
        </span>
      </a>
      {note !== '' && (
        <div className="mt-xs border-l-2 border-tinta pl-sm">
          <p className="m-0 text-label text-tinta-2">{NOTE_HEADING}</p>
          <p className="m-0 text-nota leading-nota break-words whitespace-pre-line">
            {note}
          </p>
        </div>
      )}
      <SiteButton
        variant="light"
        className="mt-xs"
        aria-label={removeLabel(text)}
        onClick={() => onRemove(id)}
      >
        {REMOVE_HIGHLIGHT}
      </SiteButton>
    </li>
  )
}

/** The Grifos, or what to do when there is none. */
export function HighlightList({
  highlights,
  onRemove,
}: {
  highlights: ReadonlyArray<Highlight>
  onRemove: (id: string) => void
}) {
  if (highlights.length === 0)
    return (
      <Section aria-labelledby="t-grifos">
        <Headline id="t-grifos">{EMPTY_HEADING}</Headline>
        <p className="m-0">{EMPTY_LINE}</p>
      </Section>
    )
  const groups = byPage(highlights)
  return (
    <Section aria-labelledby="t-grifos">
      <Headline id="t-grifos">
        {saved(highlights.length, groups.length)}
      </Headline>
      <ol className="m-0 list-none p-0">
        {groups.map((group) => (
          <li
            key={group.path}
            className="not-first:mt-lg not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta not-first:pt-md"
            data-slot="pagina-grifada"
          >
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
          </li>
        ))}
      </ol>
    </Section>
  )
}
