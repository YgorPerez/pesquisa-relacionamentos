// The example data for the Guide's stories, built by the real view
// (`content/guide-view.ts`) over the e2e fixture, which Storybook loads
// through `virtual:library` (`.storybook/vite.config.ts`).
import { topicBySlug } from '@tem-estudo/content/queries'
import library from 'virtual:library'
import {
  excerptWithReferences,
  guideView,
  type ChapterBlock,
} from '#/content/guide-view'

/** The fixture's Guide of "Onde conhecer pessoas": two Chapters, two
 * Questions, a Myth, a Tip and the marks inside a sentence. */
export const GUIDE = (() => {
  const found = topicBySlug(library, 'onde-conhecer-pessoas')
  if (!found) throw new Error('the fixture has no onde-conhecer-pessoas Topic')
  return guideView(found, library)
})()

const blocks = GUIDE.chapters.flatMap((c) => c.blocks)

function block<K extends ChapterBlock['kind']>(
  kind: K,
): Extract<ChapterBlock, { kind: K }> {
  const found = blocks.find((b) => b.kind === kind)
  if (!found) throw new Error(`the fixture Guide has no ${kind} block`)
  return found as Extract<ChapterBlock, { kind: K }>
}

/** The fixture's Tip, as a Chapter places it. */
export const TIP = block('tip').tip

/** The fixture's Myth, as a Chapter places it. */
export const MYTH = block('myth').myth

/** The HTML of a Guide paragraph, as the server builds it from markdown. */
export const excerpt = excerptWithReferences
