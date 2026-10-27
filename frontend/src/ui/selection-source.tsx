// "De onde vem isso?" of the popover on selected text (#336): the Fact
// sheets the selected sentences cite, each as the page's list of cited Fact
// sheets shows it (title, Status, Strength) and leading to its page. A
// sentence with no citation says so, and the panel lists the Fact sheets of
// its Chapter, or of the page outside a Chapter (`selection-sentences.ts`).
//
// The page says which Fact sheets it has with `<PageSources>` around its
// `<SelectionPopover />`; without it, the action is not there. The count
// carries the action's name only.
import { createContext, useContext, type ReactNode } from 'react'
import type { FactSheetSummary } from '#/content/view'
import { SiteButton } from './button'
import { FactSheetTitle } from './guide'
import { ACTION_LABEL } from './selection-popover.copy'
import { countSelection } from './selection-count'
import type { SelectionActionProps } from './selection-quote'
import {
  CITES,
  CITES_NONE,
  NEARBY,
  NEARBY_OTHERS,
  type SourcesPage,
} from './selection-source.copy'
import { sourcesOf, type SelectionSources } from './selection-sentences'

interface PageSourcesValue {
  /** Every Fact sheet the page's rings lead to, in the page's order. */
  readonly factSheets: ReadonlyArray<FactSheetSummary>
  readonly page: SourcesPage
}

const PageSourcesContext = createContext<PageSourcesValue | null>(null)

/** The page's Fact sheets, for "De onde vem isso?": on a Guide or a Tip,
 * its cited Fact sheets; on a Fact sheet's page, that Fact sheet. */
export function PageSources({
  factSheets,
  page,
  children,
}: PageSourcesValue & { children: ReactNode }) {
  return (
    <PageSourcesContext value={{ factSheets, page }}>
      {children}
    </PageSourcesContext>
  )
}

/** The page's Fact sheets among `slugs`, in the page's order. */
const among = (
  factSheets: PageSourcesValue['factSheets'],
  slugs: ReadonlyArray<string>,
) => {
  const wanted = new Set(slugs)
  return factSheets.filter((f) => wanted.has(f.slug))
}

function SourceList({
  factSheets,
}: {
  factSheets: ReadonlyArray<FactSheetSummary>
}) {
  return (
    <ul className="m-0 mt-1 list-none p-0">
      {factSheets.map((factSheet) => (
        <li key={factSheet.slug} className="not-first:mt-xs">
          <FactSheetTitle factSheet={factSheet} />
        </li>
      ))}
    </ul>
  )
}

const LINE = 'm-0 text-label leading-nota font-normal text-tinta-2'

/** The Fact sheets near the sentences with no citation: their Chapters', or
 * the page's when one sits outside a Chapter. */
function nearby(
  sources: SelectionSources,
  { factSheets, page }: PageSourcesValue,
) {
  const chapters = sources.uncited.flatMap((u) => (u ? [u] : []))
  const onPage = chapters.length < sources.uncited.length
  const list = onPage
    ? factSheets
    : among(
        factSheets,
        chapters.flatMap((c) => c.slugs),
      )
  const kind = onPage ? page : chapters.length > 1 ? 'chapters' : 'chapter'
  const cited = new Set(sources.cited)
  return {
    label: (cited.size > 0 ? NEARBY_OTHERS : NEARBY)[kind],
    factSheets: list.filter((f) => !cited.has(f.slug)),
  }
}

function SourcesPanel({
  sources,
  page,
}: {
  sources: SelectionSources
  page: PageSourcesValue
}) {
  const count =
    sources.uncited.length > 0 && sources.cited.length > 0
      ? 'some'
      : sources.sentences > 1
        ? 'many'
        : 'one'
  const near = sources.uncited.length > 0 ? nearby(sources, page) : null
  return (
    <div role="status" className="max-h-80 overflow-y-auto">
      {sources.cited.length > 0 && (
        <>
          <p className={LINE}>{CITES[count]}</p>
          <SourceList factSheets={among(page.factSheets, sources.cited)} />
        </>
      )}
      {near && (
        <>
          <p className={sources.cited.length > 0 ? `${LINE} mt-sm` : LINE}>
            <b className="text-tinta">{CITES_NONE[count]}</b>
            {near.factSheets.length > 0 && ` ${near.label}`}
          </p>
          <SourceList factSheets={near.factSheets} />
        </>
      )}
    </div>
  )
}

/** "De onde vem isso?": the panel with the Fact sheets behind the
 * selection. */
export function WhereFrom({ quote, show }: SelectionActionProps) {
  const page = useContext(PageSourcesContext)
  if (!page) return null
  const open = () => {
    countSelection('source')
    show(<SourcesPanel sources={sourcesOf(quote.range)} page={page} />)
  }
  return (
    <SiteButton variant="light" onClick={open}>
      {ACTION_LABEL.source}
    </SiteButton>
  )
}
