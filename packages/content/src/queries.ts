// Queries over the assembled library. Only outside types: the browser and the
// server functions import from here without pulling `node:fs` or Effect.
import type { Library } from './library.ts'
import type { Tip, Guide, Topic, Myth } from './items.ts'

export const guideBySlug = (
  library: Library,
  slug: string,
): Guide | undefined => library.guides.find((g) => g.slug === slug)

export const topicBySlug = (
  library: Library,
  slug: string,
): Topic | undefined => library.topics.find((t) => t.slug === slug)

export const tipBySlug = (library: Library, slug: string): Tip | undefined =>
  library.tips.find((d) => d.slug === slug)

/** The topic's guides, in its `order`. */
export const topicGuides = (
  library: Library,
  topic: string,
): ReadonlyArray<Guide> => library.guides.filter((g) => g.topic === topic)

/** The guides that carry the tip, loose or after a finding, in topic
 * order. */
export const guidesWithTip = (
  library: Library,
  tip: string,
): ReadonlyArray<Guide> =>
  library.guides.filter((g) => guideTips(g).includes(tip))

/** Only a tip whose fact sheets are all ✅ or 🟡 goes to the site. */
export const isTipPublished = (tip: Pick<Tip, 'published'>): boolean =>
  tip.published

/** Every tip of a Question in page order: those after each finding, then
 * the loose ones. */
export function guideTips(
  guide: Pick<Guide, 'tips'> & {
    readonly findings: ReadonlyArray<{ readonly tips?: ReadonlyArray<string> }>
  },
): ReadonlyArray<string> {
  return [
    ...new Set([...guide.findings.flatMap((f) => f.tips ?? []), ...guide.tips]),
  ]
}

/** Every myth of a Question in page order: those after each finding, then
 * the loose ones. */
export function guideMyths(
  guide: Pick<Guide, 'myths'> & {
    readonly findings: ReadonlyArray<{ readonly myths?: ReadonlyArray<Myth> }>
  },
): ReadonlyArray<Myth> {
  return [...guide.findings.flatMap((f) => f.myths ?? []), ...guide.myths]
}
