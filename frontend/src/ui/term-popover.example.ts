// The example data for the Verbetes' stories, built by the real view
// (`content/terms-view.ts`) over the e2e fixture, which Storybook loads
// through `virtual:library`.
import library from 'virtual:library'
import { glossaryView } from '#/content/terms-view'

/** The fixture's Verbetes, alphabetical: an institution with its Study, and
 * "satisfação", which Costa's Fact sheet defines. */
export const TERMS = glossaryView(library)
export const SATISFACTION = TERMS.find((t) => t.slug === 'satisfacao')!
