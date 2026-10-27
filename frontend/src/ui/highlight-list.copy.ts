// The words of `/grifos` (`highlight-list.tsx`, #335), shared with its tests.
// "Sua nota" and "Tirar grifo" are the Grifo popover's (`highlight.copy.ts`).
import { REMOVE_HIGHLIGHT } from './highlight.copy'

/** The page's title, its last word marked in yellow. */
export const PAGE_TITLE = { rest: 'Seus', marked: 'grifos' } as const

/** The tab's title and the footer's link. */
export const HIGHLIGHTS = 'Grifos'

/** In the Grifo's popover, the way to the list. */
export const ALL_HIGHLIGHTS = 'Ver todos os grifos'

export const LEAD =
  'Os trechos que você grifou nos Guias, nas Dicas e nas Fichas, com a sua nota. Ficam só neste navegador: não vão para o servidor nem para outro aparelho.'

/** The page needs the browser to read them. */
export const NEEDS_JS =
  'Os grifos ficam guardados no navegador, e esta página precisa de JavaScript para mostrá-los.'

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`

/** The count over the list. */
export const saved = (highlights: number, pages: number) =>
  `${plural(highlights, 'grifo', 'grifos')} em ${plural(pages, 'página', 'páginas')}`

export const EMPTY_HEADING = 'Nenhum grifo ainda'

export const EMPTY_LINE =
  'Selecione um trecho de um Guia, de uma Dica ou de uma Ficha e toque em “Grifar”. Ele aparece aqui, com a nota que você escrever.'

/** Over a Grifo whose quote is no longer on its page. */
export const CHANGED = 'Este trecho mudou'

export const CHANGED_LINE =
  'A página foi reescrita e o trecho não está mais nela. O que você grifou e a sua nota ficam guardados aqui.'

/** The words of a quote that name it on its "Tirar grifo". */
const NAME_WORDS = 6

/** The name of a Grifo's "Tirar grifo", which starts with the button's
 * text: the list has one per Grifo. */
export function removeLabel(text: string): string {
  const words = text.split(/\s+/).filter(Boolean)
  const name = words.slice(0, NAME_WORDS).join(' ')
  return `${REMOVE_HIGHLIGHT}: ${name}${words.length > NAME_WORDS ? '…' : ''}`
}
