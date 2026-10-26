// The example data for the Guide's stories, built by the real view
// (`content/guide-view.ts`) over the e2e fixture, which Storybook loads
// through `virtual:library` (`.storybook/vite.config.ts`).
import { topicBySlug } from '@tem-estudo/content/queries'
import library from 'virtual:library'
import { excerptWithReferences, guideView } from '#/content/guide-view'

/** The fixture's Guide of "Onde conhecer pessoas", with two Questions. */
export const GUIDE = (() => {
  const found = topicBySlug(library, 'onde-conhecer-pessoas')
  if (!found) throw new Error('the fixture has no onde-conhecer-pessoas Topic')
  return guideView(found, library)
})()

const question = (slug: string) => {
  const found = GUIDE.questions.find((q) => q.slug === slug)
  if (!found) throw new Error(`the fixture Guide has no ${slug} Question`)
  return found
}

/** The fixture's Question with Tips, divergence and Myths. */
export const QUESTION = question('onde-os-casais-se-conhecem')

/** The fixture's Question with a section of its own ("Então, vale a
 * pena?"). */
export const QUESTION_WITH_SECTIONS = question('app-ou-presencial')

/** The HTML of a Guide paragraph, as the server builds it from markdown. */
export const excerpt = excerptWithReferences
