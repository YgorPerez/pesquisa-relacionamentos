// The words of "Seus trechos" (`/trechos`, #335, #347) and of its Grifos
// section (`highlight-list.tsx`), shared with their tests. "Sua nota" and
// "Tirar grifo" are the Grifo popover's (`highlight.copy.ts`); the
// Comentários section's are `sent-comment-list.copy.ts`.
import { REMOVE_HIGHLIGHT } from './highlight.copy'

/** The page's title, its last word marked in yellow. */
export const PAGE_TITLE = { rest: 'Seus', marked: 'trechos' } as const

/** The tab's title and the footer's link. */
export const KEPT_PASSAGES = 'Seus trechos'

/** The Grifos section's title. */
export const HIGHLIGHTS = 'Grifos'

/** In the Grifo's popover, the way to the list. */
export const ALL_HIGHLIGHTS = 'Ver todos os grifos'

export const LEAD =
  'Os trechos que você grifou nos Guias, nas Dicas e nas Fichas, com a sua nota, e os que você comentou. A lista fica só neste navegador: não vai para outro aparelho.'

/** The page needs the browser to read them. */
export const NEEDS_JS =
  'Os grifos e os comentários enviados ficam guardados no navegador, e esta página precisa de JavaScript para mostrá-los.'

export const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`

/** The count over the list. */
export const saved = (highlights: number, pages: number) =>
  `${plural(highlights, 'grifo', 'grifos')} em ${plural(pages, 'página', 'páginas')}`

/** The start of the line with no Grifo. */
export const NO_HIGHLIGHTS = 'Nenhum grifo ainda.'

export const EMPTY_LINE = `${NO_HIGHLIGHTS} Selecione um trecho de um Guia, de uma Dica ou de uma Ficha e toque em “Grifar”. Ele aparece aqui, com a nota que você escrever.`

/** Over a Grifo or a Comentário whose quote is no longer on its page. */
export const CHANGED = 'Este trecho mudou'

export const CHANGED_LINE =
  'A página foi reescrita e o trecho não está mais nela. O que você grifou e a sua nota ficam guardados aqui.'

/** The words of a quote that name it on its button. */
const NAME_WORDS = 6

/** The name of a button the list has once per quote, which starts with
 * the button's text: "Tirar grifo: A satisfação de quem…". */
export function quoteButtonLabel(action: string, text: string): string {
  const words = text.split(/\s+/).filter(Boolean)
  const name = words.slice(0, NAME_WORDS).join(' ')
  return `${action}: ${name}${words.length > NAME_WORDS ? '…' : ''}`
}

/** The name of a Grifo's "Tirar grifo". */
export const removeLabel = (text: string): string =>
  quoteButtonLabel(REMOVE_HIGHLIGHT, text)
