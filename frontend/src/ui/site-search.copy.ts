// The words of the site search (`site-search.tsx`, #275), shared with its
// tests.
import type { SearchKind } from '#/content/site-search-view'

/** The page's title, its first word marked in yellow. */
export const TITLE = { marked: 'Buscar', rest: 'no site' } as const

/** The header's magnifier and the tab's title. */
export const SEARCH = `${TITLE.marked} ${TITLE.rest}`

/** The field's label. */
export const FIELD = 'Palavra ou frase'

export const SUBMIT = 'Buscar'

/** Under the title, before any search. */
export const SEARCH_LINE =
  'Procura nos Guias, nas Dicas e nas Fichas. Acento e maiúscula não contam. Cada trecho leva à frase, marcada na página.'

/** The tag before each page's title. */
export const KIND_TAG: Readonly<Record<SearchKind, string>> = {
  guide: 'Guia',
  tip: 'Dica',
  'fact-sheet': 'Ficha',
}

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`

/** The count over the results. */
export const found = (hits: number, pages: number) =>
  `${plural(hits, 'trecho', 'trechos')} em ${plural(pages, 'página', 'páginas')}`

/** When the exact phrase occurs nowhere. */
export const WORDS_ONLY =
  'A frase exata não aparece no site. Estes trechos têm todas as palavras, em qualquer ordem.'

/** When nothing has the query. */
export const nothingFound = (query: string) =>
  `Nada encontrado para “${query}”.`

export const NOTHING_LINE =
  'Tente outra palavra, uma parte dela ou menos palavras.'
