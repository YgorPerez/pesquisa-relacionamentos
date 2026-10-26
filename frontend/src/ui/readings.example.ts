// The example data for the Readings' stories, built by the real view
// (`content/neighbor-sites-view.ts`) over the e2e fixture, which Storybook
// loads through `virtual:library`.
import library from 'virtual:library'
import { topicReadingViews } from '#/content/neighbor-sites-view'

/** The fixture's three Readings of "Onde conhecer pessoas": two in
 * Portuguese, one with its own notice, and one in English with its site's. */
export const READINGS = topicReadingViews(library, 'onde-conhecer-pessoas')
