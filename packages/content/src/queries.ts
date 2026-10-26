// Queries over the assembled library. Only outside types: the browser and the
// server functions import from here without pulling `node:fs` or Effect.
import type { Library } from './library.ts'
import type { Question, Tip, Topic } from './items.ts'
import type { Reading } from './neighbor-sites.ts'

export const questionBySlug = (
  library: Library,
  slug: string,
): Question | undefined => library.questions.find((q) => q.slug === slug)

export const topicBySlug = (
  library: Library,
  slug: string,
): Topic | undefined => library.topics.find((t) => t.slug === slug)

export const tipBySlug = (library: Library, slug: string): Tip | undefined =>
  library.tips.find((d) => d.slug === slug)

/** The topic's Questions, in the order of its Guide's `questions`. */
export const topicQuestions = (
  library: Library,
  topic: string,
): ReadonlyArray<Question> => library.questions.filter((q) => q.topic === topic)

/** The Questions answered in the Chapters that place the Tip, in topic
 * order: the Tip belongs to the reasoning that answers them. */
export function questionsWithTip(
  library: Library,
  tip: string,
): ReadonlyArray<Question> {
  const chapters = new Set(
    library.topics.flatMap((t) =>
      t.chapters
        .filter((c) => c.parts.some((p) => p.kind === 'tip' && p.slug === tip))
        .map((c) => `${t.slug}#${c.id}`),
    ),
  )
  return library.questions.filter((q) =>
    chapters.has(`${q.topic}#${q.chapter}`),
  )
}

/** Only a tip whose fact sheets are all ✅ or 🟡 goes to the site. */
export const isTipPublished = (tip: Pick<Tip, 'published'>): boolean =>
  tip.published

/** The Topic's Readings, Portuguese first, each language in file order. A
 * Reading of several Topics is in each one's list. */
export function topicReadings(
  library: Pick<Library, 'readings' | 'neighborSites'>,
  topic: string,
): ReadonlyArray<Reading> {
  const portuguese = new Set(
    library.neighborSites.filter((s) => s.language === 'pt').map((s) => s.id),
  )
  const ofTopic = library.readings.filter((r) => r.topics.includes(topic))
  return [
    ...ofTopic.filter((r) => portuguese.has(r.site)),
    ...ofTopic.filter((r) => !portuguese.has(r.site)),
  ]
}
