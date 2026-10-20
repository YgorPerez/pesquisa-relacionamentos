// Topics, Guides and Tips for the pages, read on the server like the Fact
// sheets (`fact-sheets.ts`): the browser gets only each page's finished view.
import type { Strength } from '@tem-estudo/content'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  tipBySlug,
  isTipPublished,
  guideBySlug,
  topicBySlug,
} from '@tem-estudo/content/queries'
import {
  tipSummary,
  guideSummary,
  withoutMarks,
  tipView,
  guideView,
  topicView,
  type TipSummary,
  type TipView,
  type GuideSummary,
  type GuideView,
  type TopicView,
} from './guide-view'
import { buildPrioritiesView, type PrioritiesView } from './priorities-view'

const text = (value: unknown, name: string): string => {
  if (typeof value !== 'string') throw new Error(`invalid ${name}`)
  return value
}

interface HomeTopic {
  readonly slug: string
  readonly title: string
  readonly guides: ReadonlyArray<GuideSummary>
}

/** The Topics with their Questions in order, for the home page. */
export const listTopics = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ReadonlyArray<HomeTopic>> => {
    const { default: library } = await import('virtual:library')
    return library.topics.map((topic): HomeTopic => ({
      slug: topic.slug,
      title: topic.title,
      guides: library.guides
        .filter((g) => g.topic === topic.slug)
        .map(guideSummary),
    }))
  },
)

export const getTopic = createServerFn({ method: 'GET' })
  .validator((slug: unknown) => text(slug, 'topic'))
  .handler(async ({ data: slug }): Promise<TopicView> => {
    const { default: library } = await import('virtual:library')
    const topic = topicBySlug(library, slug)
    if (!topic) throw notFound()
    return topicView(topic, library)
  })

export const getGuide = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const { topic, slug } = (data ?? {}) as Record<string, unknown>
    return { topic: text(topic, 'topic'), slug: text(slug, 'slug') }
  })
  .handler(
    async ({
      data,
    }): Promise<
      GuideView & {
        priorities: PrioritiesView | null
        possibleGroup: boolean
      }
    > => {
      const { default: library } = await import('virtual:library')
      const guide = guideBySlug(library, data.slug)
      if (!guide || guide.topic !== data.topic) throw notFound()
      return {
        ...guideView(guide, library),
        // The B1 card reads the same file as the `/prioridades` page.
        priorities:
          guide.calculator === 'priorities'
            ? buildPrioritiesView(library)
            : null,
        // The B5 card does the count in the browser, with the build's data.
        possibleGroup: guide.calculator === 'possible-group',
      }
    },
  )

export interface CalculatorGuide {
  readonly topic: string
  readonly slug: string
  readonly question: string
  readonly confidence: Strength
  /** The short answer in plain text: the references lead to Fact sheets on
   * the Guide's page. */
  readonly answer: string
}

/** The Guide that hosts the calculator (`calculator:` in the frontmatter),
 * for the "Do Guia" block on its page; `null` while no published Guide hosts
 * it. */
export const getCalculatorGuide = createServerFn({ method: 'GET' })
  .validator((name: unknown) => text(name, 'calculator'))
  .handler(async ({ data: name }): Promise<CalculatorGuide | null> => {
    const { default: library } = await import('virtual:library')
    const guide = library.guides.find((g) => g.calculator === name)
    if (!guide) return null
    const summary = guideSummary(guide)
    return {
      topic: guide.topic,
      slug: guide.slug,
      question: summary.question,
      confidence: guide.confidence,
      answer: withoutMarks(guide.shortAnswer),
    }
  })

/** The Priorities calculator; `null` while the file is not in the build. */
export const getPriorities = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PrioritiesView | null> => {
    const { default: library } = await import('virtual:library')
    return buildPrioritiesView(library)
  },
)

/** The published Tips: those that rest only on ✅ or 🟡 Fact sheets. */
export const listTips = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ReadonlyArray<TipSummary>> => {
    const { default: library } = await import('virtual:library')
    return library.tips.filter(isTipPublished).map(tipSummary)
  },
)

export const getTip = createServerFn({ method: 'GET' })
  .validator((slug: unknown) => text(slug, 'slug'))
  .handler(async ({ data: slug }): Promise<TipView> => {
    const { default: library } = await import('virtual:library')
    const tip = tipBySlug(library, slug)
    if (!tip || !isTipPublished(tip)) throw notFound()
    return tipView(tip, library)
  })
