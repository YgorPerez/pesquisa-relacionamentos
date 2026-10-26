// Topics (each one's page is its Guide) and Tips for the pages, read on the
// server like the Fact sheets (`fact-sheets.ts`): the browser gets only each
// page's finished view.
import type { Strength } from '@tem-estudo/content'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  tipBySlug,
  isTipPublished,
  topicBySlug,
} from '@tem-estudo/content/queries'
import {
  tipSummary,
  questionSummary,
  withoutMarks,
  tipView,
  guideView,
  type TipSummary,
  type TipView,
  type QuestionSummary,
  type GuideView,
} from './guide-view'
import { buildPrioritiesView, type PrioritiesView } from './priorities-view'

const text = (value: unknown, name: string): string => {
  if (typeof value !== 'string') throw new Error(`invalid ${name}`)
  return value
}

interface HomeTopic {
  readonly slug: string
  readonly title: string
  readonly questions: ReadonlyArray<QuestionSummary>
}

/** The Topics with their Questions in order, for the home page. */
export const listTopics = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ReadonlyArray<HomeTopic>> => {
    const { default: library } = await import('virtual:library')
    return library.topics.map((topic): HomeTopic => ({
      slug: topic.slug,
      title: topic.title,
      questions: library.guides
        .filter((g) => g.topic === topic.slug)
        .map(questionSummary),
    }))
  },
)

/** The Topic's page, its Guide (ADR 0042), with the data of the calculator
 * cards its Questions host. */
export const getGuide = createServerFn({ method: 'GET' })
  .validator((slug: unknown) => text(slug, 'topic'))
  .handler(
    async ({
      data: slug,
    }): Promise<GuideView & { priorities: PrioritiesView | null }> => {
      const { default: library } = await import('virtual:library')
      const topic = topicBySlug(library, slug)
      if (!topic) throw notFound()
      const guide = guideView(topic, library)
      return {
        ...guide,
        // The B1 card reads the same file as the `/prioridades` page. The B5
        // card does the count in the browser, with the build's data.
        priorities: guide.questions.some((q) => q.calculator === 'priorities')
          ? buildPrioritiesView(library)
          : null,
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

/** The Question that hosts the calculator (`calculator:` in the
 * frontmatter), for the "Do Guia" block on its page; `null` while no
 * Question hosts it. */
export const getCalculatorGuide = createServerFn({ method: 'GET' })
  .validator((name: unknown) => text(name, 'calculator'))
  .handler(async ({ data: name }): Promise<CalculatorGuide | null> => {
    const { default: library } = await import('virtual:library')
    const guide = library.guides.find((g) => g.calculator === name)
    if (!guide) return null
    const summary = questionSummary(guide)
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
