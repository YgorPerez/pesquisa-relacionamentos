// The popover on selected text (#332): the texts the pieces and their tests
// share.
import type { SelectionAction } from '#/analytics/events'

/** The popover's name, for the screen reader. */
export const POPOVER_LABEL = 'Trecho selecionado'

/** Each action's button, in the popover's order. */
export const ACTION_LABEL: Readonly<Record<SelectionAction, string>> = {
  copy: 'Copiar',
  link: 'Copiar link',
  highlight: 'Grifar',
  source: 'De onde vem isso?',
  comment: 'Comentar',
}

/** How a copy went: done, or the field to copy by hand. */
export const COPIED = { copy: 'Trecho copiado.', link: 'Link copiado.' }
export const COPY_FAILED = {
  copy: 'Não deu para copiar. O trecho está aqui embaixo:',
  link: 'Não deu para copiar. O link está aqui embaixo:',
}
export const COPY_BY_HAND = {
  copy: 'Trecho para copiar',
  link: 'Link para copiar',
}
