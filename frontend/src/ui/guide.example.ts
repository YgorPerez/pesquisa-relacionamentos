// The example data for the Guide's stories, built by the real view
// (`content/guide-view.ts`) over the e2e fixture, which Storybook loads
// through `virtual:library` (`.storybook/vite.config.ts`).
import { guideBySlug } from '@tem-estudo/content/queries'
import library from 'virtual:library'
import { excerptWithReferences, guideView } from '#/content/guide-view'

/** The fixture's Guide with Tips, divergence and Myths. */
export const GUIDE = (() => {
  const found = guideBySlug(library, 'onde-os-casais-se-conhecem')
  if (!found)
    throw new Error('the fixture has no onde-os-casais-se-conhecem Guide')
  return guideView(found, library)
})()

/** The fixture's Guide with a section of its own ("Então, vale a pena?"). */
export const GUIDE_WITH_SECTIONS = (() => {
  const found = guideBySlug(library, 'app-ou-presencial')
  if (!found) throw new Error('the fixture has no app-ou-presencial Guide')
  return guideView(found, library)
})()

/** The HTML of a Guide paragraph, as the server builds it from markdown. */
export const excerpt = excerptWithReferences
