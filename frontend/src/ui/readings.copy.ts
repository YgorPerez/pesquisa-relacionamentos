// The words of the Readings and of the Guide's "Para ler além daqui"
// (`readings.tsx`), shared with their tests.
import type { NoticeKind, ReadingLanguage } from '@tem-estudo/content'

/** The tag before each notice: what kind of interest the site has. */
export const NOTICE_TAG: Readonly<Record<NoticeKind, string>> = {
  commercial: 'vende algo',
  cause: 'defende uma causa',
}

/** After the site's name. Portuguese, the reader's language, says nothing. */
export const LANGUAGE_NOTE: Readonly<Record<ReadingLanguage, string | null>> = {
  pt: null,
  en: 'em inglês',
}

/** Read by a screen reader after the title: the link opens another tab. */
export const NEW_TAB = '(abre em outra aba)'

/** The title of the Guide's last block. */
export const FURTHER_READING = 'Para ler além daqui'

/** Under that title: what the Readings are and what they are not. */
export const FURTHER_READING_LINE =
  'Páginas de outros sites que citam os estudos de que falam. Este Guia não se apoia nelas, só nas Fichas.'

/** The way from the block to the page with every Topic. */
export const ALL_NEIGHBOR_SITES = 'Leituras de todos os Temas'
