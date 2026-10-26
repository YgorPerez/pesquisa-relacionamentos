// What links the files: findings and tips inherit country, period and
// `covers` from the cited fact sheets, and the publication rules of #7 and
// #10 stop the build.
import type { Coverage } from './schema.ts'
import type { FactSheet } from './fact-sheet.ts'
import {
  UNKNOWNS_TITLE,
  type Chapter,
  type GuideFinding,
  type Myth,
  type ParsedQuestion,
  type ParsedTip,
  type ParsedTopic,
  type Question,
  type Tip,
  type Topic,
} from './items.ts'
import type { Strength } from './lists.ts'
import { problem, type Problem } from './problems.ts'

/** A reference to a fact sheet in the middle of the text: `[@fact-sheet-slug]`. */
const REFERENCE = /\[@([a-z0-9]+(?:-[a-z0-9]+)*)\]/g

/** The slugs cited as `[@slug]` in a markdown, in order. */
export function referencesInText(markdown: string): string[] {
  return [...markdown.matchAll(REFERENCE)].map((m) => m[1] ?? '')
}

const unique = <T>(list: ReadonlyArray<T>): T[] => [...new Set(list)]

/** What a finding or tip inherits from its fact sheets. The keys keep the
 * frontmatter names. */
function inherited(
  factSheets: ReadonlyArray<FactSheet>,
  own: { country?: string; period?: string; applies_to?: Coverage },
) {
  return {
    countries: own.country
      ? [own.country]
      : unique(factSheets.flatMap((f) => f.countries)),
    period: own.period ?? unique(factSheets.map((f) => f.period)).join('; '),
    covers: own.applies_to ? [own.applies_to] : factSheets.map((f) => f.covers),
    scoped: own.applies_to !== undefined,
  }
}

export interface ParsedItems {
  readonly factSheets: ReadonlyArray<FactSheet>
  readonly topics: ReadonlyArray<ParsedTopic>
  readonly questions: ReadonlyArray<ParsedQuestion>
  readonly tips: ReadonlyArray<ParsedTip>
  /** The paths of the files that exist but did not parse. They count as
   * existing, so an error in one file does not turn into "does not exist" in
   * the others. */
  readonly broken: ReadonlySet<string>
}

export interface Linked {
  readonly topics: ReadonlyArray<Topic>
  readonly questions: ReadonlyArray<Question>
  readonly tips: ReadonlyArray<Tip>
  readonly errors: ReadonlyArray<Problem>
}

const mythFactSheets = (m: Myth) => [
  ...referencesInText(m.why_not),
  ...m.fact_sheets,
]

interface Lookups {
  readonly questions: ReadonlyMap<string, ParsedQuestion>
  readonly tips: ReadonlyMap<string, ParsedTip>
}

/** A Chapter's fact sheets in page order: its text, and the answer, Tip or
 * Myth each line places. */
function chapterFactSheets(
  topic: ParsedTopic,
  chapter: Chapter,
  { questions, tips }: Lookups,
): string[] {
  return chapter.parts.flatMap((part) => {
    switch (part.kind) {
      case 'text':
        return referencesInText(part.markdown)
      case 'question':
        return referencesInText(questions.get(part.slug)?.answer ?? '')
      case 'tip':
        return tips.get(part.slug)?.fact_sheets ?? []
      case 'myth': {
        const myth = topic.myths.find((m) => m.id === part.id)
        return myth ? mythFactSheets(myth) : []
      }
    }
  })
}

/** The Guide's page in order: the opening, each Chapter, "O que levar" and
 * "O que não se sabe". */
function pageFactSheets(topic: ParsedTopic, lookups: Lookups): string[] {
  return unique([
    ...referencesInText(topic.opening),
    ...topic.chapters.flatMap((c) => chapterFactSheets(topic, c, lookups)),
    ...topic.takeaways.flatMap(
      (slug) => lookups.tips.get(slug)?.fact_sheets ?? [],
    ),
    ...referencesInText(topic.unknowns),
  ])
}

/** Where the Guide cites fact sheets directly (not counting the tips), field
 * by field. */
interface Citation {
  readonly field: string
  readonly factSheets: ReadonlyArray<string>
}

function topicCitations(
  topic: ParsedTopic,
  questions: ReadonlyArray<ParsedQuestion>,
): Citation[] {
  return [
    { field: 'opening', factSheets: referencesInText(topic.opening) },
    ...topic.chapters.map((c) => ({
      field: c.title,
      factSheets: c.parts.flatMap((p) =>
        p.kind === 'text' ? referencesInText(p.markdown) : [],
      ),
    })),
    ...questions.map((q, i) => ({
      field: `questions.${i}.answer`,
      factSheets: referencesInText(q.answer),
    })),
    ...topic.findings.flatMap((f, i) => [
      { field: `findings.${i}.text`, factSheets: referencesInText(f.text) },
      { field: `findings.${i}.fact_sheets`, factSheets: f.fact_sheets },
    ]),
    ...topic.myths.flatMap((m, i) => [
      { field: `myths.${i}.why_not`, factSheets: referencesInText(m.why_not) },
      { field: `myths.${i}.fact_sheets`, factSheets: m.fact_sheets },
    ]),
    { field: UNKNOWNS_TITLE, factSheets: referencesInText(topic.unknowns) },
  ]
}

const RANK: Record<Strength, number> = { weak: 1, moderate: 2, strong: 3 }

/** The confidence never goes above the strongest fact sheet of the findings
 * the answer rests on, and stays at moderate at most when all of them are 🟡
 * (#7). Tips do not count: each one carries its own strength. */
function confidenceCeiling(
  question: ParsedQuestion,
  field: string,
  backing: ReadonlyArray<FactSheet>,
): Problem[] {
  const factSheets = backing.filter((f) => f.status !== 'unverified')
  if (factSheets.length === 0) return []
  const confidence = RANK[question.confidence]
  const strongest = factSheets.reduce((a, b) =>
    RANK[b.strength] > RANK[a.strength] ? b : a,
  )
  if (confidence > RANK[strongest.strength])
    return [
      problem(
        question.file,
        `the confidence (${question.confidence}) is above the strongest fact sheet of the findings the answer rests on (${strongest.strength})`,
        field,
      ),
    ]
  if (
    confidence > RANK.moderate &&
    factSheets.every((f) => f.status === 'partial')
  )
    return [
      problem(
        question.file,
        `the confidence (${question.confidence}) is above moderate, and the answer's findings only cite partial (🟡) fact sheets`,
        field,
      ),
    ]
  return []
}

/** Each topic has its own `position`; a Question's slug is unique across the
 * site, because `related` and the old links cite it alone. */
function topicsAndQuestions(items: ParsedItems): Problem[] {
  const errors: Problem[] = []
  const byPosition = new Map<number, string>()
  for (const topic of items.topics) {
    const other = byPosition.get(topic.position)
    if (other)
      errors.push(
        problem(
          topic.file,
          `the position ${topic.position} already belongs to the topic "${other}"; each topic has its own place on the home page`,
          'position',
        ),
      )
    else byPosition.set(topic.position, topic.slug)
  }
  const first = new Map<string, ParsedQuestion>()
  for (const question of items.questions) {
    const other = first.get(question.slug)
    if (other && other.file !== question.file)
      errors.push(
        problem(
          question.file,
          `the Question "${question.slug}" already belongs to ${other.file}; a Question is cited by its slug alone`,
          'questions',
        ),
      )
    else if (!other) first.set(question.slug, question)
  }
  return errors
}

export function link(items: ParsedItems): Linked {
  const errors: Problem[] = []
  const factSheetBySlug = new Map(items.factSheets.map((f) => [f.slug, f]))
  const tipBySlug = new Map(items.tips.map((d) => [d.slug, d]))
  const questionBySlug = new Map(items.questions.map((q) => [q.slug, q]))
  const factSheetsOf = (slugs: ReadonlyArray<string>) =>
    unique(slugs).flatMap((s) => {
      const factSheet = factSheetBySlug.get(s)
      return factSheet ? [factSheet] : []
    })

  const missingFactSheet = (
    file: string,
    field: string,
    slugs: ReadonlyArray<string>,
  ) => {
    for (const slug of slugs)
      if (!factSheetBySlug.has(slug) && !items.broken.has(`studies/${slug}.md`))
        errors.push(
          problem(
            file,
            `the fact sheet "${slug}" does not exist in studies/`,
            field,
          ),
        )
  }

  const isUnverified = (slug: string) =>
    factSheetBySlug.get(slug)?.status === 'unverified'
  const ONLY_VERIFIED =
    'which was not verified (⬜); a guide only cites ✅ or 🟡 fact sheets'

  /** Each tip exists and cites only ✅ or 🟡 fact sheets. */
  const checkTips = (
    file: string,
    field: string,
    slugs: ReadonlyArray<string>,
  ) => {
    for (const slug of slugs) {
      const tip = tipBySlug.get(slug)
      if (!tip && !items.broken.has(`tips/${slug}.md`))
        errors.push(
          problem(file, `the tip "${slug}" does not exist in tips/`, field),
        )
      for (const factSheet of tip?.fact_sheets.filter(isUnverified) ?? [])
        errors.push(
          problem(
            file,
            `the tip "${slug}" cites the fact sheet "${factSheet}", ${ONLY_VERIFIED}`,
            field,
          ),
        )
    }
  }

  errors.push(...topicsAndQuestions(items))
  for (const topic of items.topics) {
    const questions = items.questions.filter((q) => q.topic === topic.slug)
    checkTips(topic.file, 'takeaways', topic.takeaways)
    for (const chapter of topic.chapters)
      checkTips(
        topic.file,
        chapter.title,
        chapter.parts.flatMap((p) => (p.kind === 'tip' ? [p.slug] : [])),
      )
    for (const { field, factSheets } of topicCitations(topic, questions)) {
      missingFactSheet(topic.file, field, factSheets)
      for (const slug of unique(factSheets).filter(isUnverified))
        errors.push(
          problem(
            topic.file,
            `cites the fact sheet "${slug}", ${ONLY_VERIFIED}`,
            field,
          ),
        )
    }
    const findings = new Map(topic.findings.map((f) => [f.id, f]))
    questions.forEach((question, i) =>
      errors.push(
        ...confidenceCeiling(
          question,
          `questions.${i}.confidence`,
          factSheetsOf(
            question.findings.flatMap((id) => {
              const finding = findings.get(id)
              return finding
                ? [...finding.fact_sheets, ...referencesInText(finding.text)]
                : []
            }),
          ),
        ),
      ),
    )
    // A Guide that did not parse may hold the Question: its own errors come
    // first.
    const someGuideBroken = [...items.broken].some((p) =>
      p.startsWith('guides/'),
    )
    for (const slug of topic.related)
      if (!questionBySlug.has(slug) && !someGuideBroken)
        errors.push(
          problem(
            topic.file,
            `the Question "${slug}" does not exist in guides/`,
            'related',
          ),
        )
  }
  for (const tip of items.tips)
    missingFactSheet(tip.file, 'fact_sheets', tip.fact_sheets)

  const tips: Tip[] = items.tips.map((parsed) => {
    const factSheets = factSheetsOf(parsed.fact_sheets)
    return {
      slug: parsed.slug,
      file: parsed.file,
      text: parsed.text,
      fact_sheets: parsed.fact_sheets,
      strength: parsed.strength,
      inference: parsed.inference ?? false,
      ...inherited(factSheets, parsed),
      published:
        factSheets.length === parsed.fact_sheets.length &&
        factSheets.every((f) => f.status !== 'unverified'),
      ...(parsed.previous ? { previous: parsed.previous } : {}),
      ...(parsed.seo ? { seo: parsed.seo } : {}),
    }
  })

  const linkFinding = (f: ParsedTopic['findings'][number]): GuideFinding => ({
    id: f.id,
    text: f.text,
    fact_sheets: f.fact_sheets,
    ...inherited(factSheetsOf(f.fact_sheets), f),
  })
  const lookups: Lookups = { questions: questionBySlug, tips: tipBySlug }
  const topics: Topic[] = items.topics.map((topic) => ({
    ...topic,
    findings: topic.findings.map(linkFinding),
    citedFactSheets: pageFactSheets(topic, lookups),
  }))
  const parsedTopic = new Map(items.topics.map((t) => [t.slug, t]))
  /** The fact sheets of the Chapter that answers the Question. */
  const ofChapter = (question: ParsedQuestion) => {
    const topic = parsedTopic.get(question.topic)
    const chapter = topic?.chapters.find((c) => c.id === question.chapter)
    return topic && chapter ? chapterFactSheets(topic, chapter, lookups) : []
  }
  const findingsOf = new Map(
    topics.map((t) => [t.slug, new Map(t.findings.map((f) => [f.id, f]))]),
  )
  const order = new Map(topics.map((t, i) => [t.slug, i]))
  const questions: Question[] = [...items.questions]
    .sort(
      (a, b) =>
        (order.get(a.topic) ?? Infinity) - (order.get(b.topic) ?? Infinity),
    )
    .map((parsed) => {
      const findings = parsed.findings.flatMap((id) => {
        const finding = findingsOf.get(parsed.topic)?.get(id)
        return finding ? [finding] : []
      })
      return {
        ...parsed,
        findings,
        citedFactSheets: unique([
          ...referencesInText(parsed.answer),
          ...findings.flatMap((f) => [
            ...referencesInText(f.text),
            ...f.fact_sheets,
          ]),
          ...ofChapter(parsed),
        ]),
      }
    })

  return { topics, questions, tips, errors }
}
