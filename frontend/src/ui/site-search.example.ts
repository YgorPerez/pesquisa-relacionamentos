// The example data for the site search's stories, built by the real search
// (`content/site-search-view.ts`) over the e2e fixture, which Storybook loads
// through `virtual:library`.
import library from 'virtual:library'
import { searchSite } from '#/content/site-search-view'

/** "app": every kind of page, and Guides with several hits. */
export const MANY = searchSite(library, 'app')

/** A phrase that does not occur, found word by word. */
export const WORDS = searchSite(library, 'pessoalmente satisfação')

export const NOTHING = searchSite(library, 'poliamor')
