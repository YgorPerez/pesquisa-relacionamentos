// What links the files: guides and tips inherit country, period and `covers`
// from the cited fact sheets, and the publication rules of #7 and #10 stop
// the build.
import type { Coverage } from './schema.ts'
import type { FactSheet } from './fact-sheet.ts'
import {
  GUIDE_SECTIONS,
  TOPIC_SECTIONS,
  type GuideFinding,
  type Tip,
  type ParsedTip,
  type Guide,
  type ParsedGuide,
  type ParsedTopic,
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
  readonly guides: ReadonlyArray<ParsedGuide>
  readonly tips: ReadonlyArray<ParsedTip>
  /** The paths of the files that exist but did not parse. They count as
   * existing, so an error in one file does not turn into "does not exist" in
   * the others. */
  readonly broken: ReadonlySet<string>
}

export interface Linked {
  readonly topics: ReadonlyArray<Topic>
  readonly guides: ReadonlyArray<Guide>
  readonly tips: ReadonlyArray<Tip>
  readonly errors: ReadonlyArray<Problem>
}

type Myth = ParsedGuide['myths'][number]

const mythFactSheets = (m: Myth) => [
  ...referencesInText(m.why_not),
  ...m.fact_sheets,
]

/** A Question's fact sheets in the order its section shows them (the page in
 * `routes/$tema/index.tsx`): short answer, own sections, each finding with
 * its tips and myths, divergence, the loose tips, "E no Brasil?", profile and
 * the loose myths. Its own Limitations show at the end of the Guide, so they
 * stay out. */
function sectionFactSheets(
  guide: ParsedGuide,
  tips: ReadonlyMap<string, ParsedTip>,
): string[] {
  const tipFactSheets = (slug: string) => tips.get(slug)?.fact_sheets ?? []
  return unique([
    ...referencesInText(guide.shortAnswer),
    ...guide.sections.flatMap((s) => referencesInText(s.markdown)),
    ...guide.findings.flatMap((a) => [
      ...referencesInText(a.text),
      ...a.fact_sheets,
      ...(a.tips ?? []).flatMap(tipFactSheets),
      ...(a.myths ?? []).flatMap(mythFactSheets),
    ]),
    ...(guide.divergence?.sides.flatMap((l) => [
      ...referencesInText(l.text),
      ...l.fact_sheets,
    ]) ?? []),
    ...guide.tips.flatMap(tipFactSheets),
    ...referencesInText(guide.inBrazil),
    ...referencesInText(guide.variesByProfile),
    ...guide.myths.flatMap(mythFactSheets),
  ])
}

/** The Guide's page in order: the opening, each Question's section, "O que
 * levar", the Topic's Limitations and then each Question's own. */
function guideFactSheets(
  topic: ParsedTopic,
  guides: ReadonlyArray<ParsedGuide>,
  tips: ReadonlyMap<string, ParsedTip>,
): string[] {
  return unique([
    ...referencesInText(topic.opening),
    ...guides.flatMap((g) => sectionFactSheets(g, tips)),
    ...topic.takeaways.flatMap((slug) => tips.get(slug)?.fact_sheets ?? []),
    ...referencesInText(topic.limitations),
    ...guides.flatMap((g) => referencesInText(g.limitations)),
  ])
}

/** Where the guide cites fact sheets directly (not counting the tips), field
 * by field. */
interface Citation {
  readonly field: string
  readonly factSheets: ReadonlyArray<string>
}

function guideCitations(guide: ParsedGuide): Citation[] {
  return [
    { field: 'short answer', factSheets: referencesInText(guide.shortAnswer) },
    ...guide.findings.flatMap((a, i) => [
      { field: `findings.${i}.text`, factSheets: referencesInText(a.text) },
      { field: `findings.${i}.fact_sheets`, factSheets: a.fact_sheets },
    ]),
    ...guide.findings.flatMap((a, i) =>
      (a.myths ?? []).flatMap((m, j) => [
        {
          field: `findings.${i}.myths.${j}.why_not`,
          factSheets: referencesInText(m.why_not),
        },
        {
          field: `findings.${i}.myths.${j}.fact_sheets`,
          factSheets: m.fact_sheets,
        },
      ]),
    ),
    ...(guide.divergence?.sides.flatMap((l, i) => [
      {
        field: `divergence.sides.${i}.text`,
        factSheets: referencesInText(l.text),
      },
      { field: `divergence.sides.${i}.fact_sheets`, factSheets: l.fact_sheets },
    ]) ?? []),
    ...guide.sections.map((s) => ({
      field: s.title,
      factSheets: referencesInText(s.markdown),
    })),
    {
      field: GUIDE_SECTIONS.inBrazil,
      factSheets: referencesInText(guide.inBrazil),
    },
    {
      field: GUIDE_SECTIONS.profile,
      factSheets: referencesInText(guide.variesByProfile),
    },
    ...guide.myths.flatMap((m, i) => [
      {
        field: `myths.${i}.why_not`,
        factSheets: referencesInText(m.why_not),
      },
      { field: `myths.${i}.fact_sheets`, factSheets: m.fact_sheets },
    ]),
    {
      field: GUIDE_SECTIONS.limitations,
      factSheets: referencesInText(guide.limitations),
    },
  ]
}

/** The ids the Guide's page uses for its own blocks: a Question's slug is its
 * section's anchor (`/<topic>#<slug>`), so it cannot be one of them. */
export const RESERVED_ANCHORS = [
  'indice',
  'perfil',
  'o-que-levar',
  'limitacoes',
  'fichas',
  'outros-temas',
] as const

const RANK: Record<Strength, number> = { weak: 1, moderate: 2, strong: 3 }

/** The confidence never goes above the strongest fact sheet backing the
 * answer, and stays at moderate at most when all of them are 🟡 (#7). Tips do
 * not count: each one carries its own strength. */
function confidenceCeiling(
  guide: ParsedGuide,
  cited: ReadonlyArray<FactSheet>,
): Problem[] {
  const factSheets = cited.filter((f) => f.status !== 'unverified')
  if (factSheets.length === 0) return []
  const confidence = RANK[guide.confidence]
  const strongest = factSheets.reduce((a, b) =>
    RANK[b.strength] > RANK[a.strength] ? b : a,
  )
  if (confidence > RANK[strongest.strength])
    return [
      problem(
        guide.file,
        `the confidence (${guide.confidence}) is above the strongest fact sheet the guide cites (${strongest.strength})`,
        'confidence',
      ),
    ]
  if (
    confidence > RANK.moderate &&
    factSheets.every((f) => f.status === 'partial')
  )
    return [
      problem(
        guide.file,
        `the confidence (${guide.confidence}) is above moderate, and the guide only cites partial (🟡) fact sheets`,
        'confidence',
      ),
    ]
  return []
}

/** Each guide folder has a `_topic.md` whose `order` lists the folder's guides,
 * each one once, and whose `position` no other topic has; a guide's slug is
 * unique across the site. */
function topicsAndGuides(items: ParsedItems): Problem[] {
  const errors: Problem[] = []
  const topics = new Map(items.topics.map((t) => [t.slug, t]))
  for (const topic of unique(items.guides.map((g) => g.topic)))
    if (!topics.has(topic) && !items.broken.has(`guides/${topic}/_topic.md`))
      errors.push(
        problem(
          `guides/${topic}`,
          'missing the _topic.md with the title and the order of the guides',
        ),
      )

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

  for (const topic of items.topics) {
    const parsedInFolder = items.guides
      .filter((g) => g.topic === topic.slug)
      .map((g) => g.slug)
    const inFolder = [
      ...parsedInFolder,
      ...[...items.broken].flatMap((c) => {
        const match = new RegExp(
          `^guides/${topic.slug}/([^_/][^/]*)\\.md$`,
        ).exec(c)
        return match?.[1] ? [match[1]] : []
      }),
    ]
    for (const slug of parsedInFolder)
      if (!topic.order.includes(slug))
        errors.push(
          problem(
            topic.file,
            `the guide "${slug}" is in the folder and missing from the order`,
            'order',
          ),
        )
    topic.order.forEach((slug, i) => {
      if (topic.order.indexOf(slug) !== i)
        errors.push(
          problem(
            topic.file,
            `the guide "${slug}" appears more than once`,
            'order',
          ),
        )
      else if (!inFolder.includes(slug))
        errors.push(
          problem(
            topic.file,
            `the guide "${slug}" does not exist in guides/${topic.slug}/`,
            'order',
          ),
        )
    })
  }

  const first = new Map<string, ParsedGuide>()
  for (const guide of items.guides) {
    const other = first.get(guide.slug)
    if (other)
      errors.push(
        problem(
          guide.file,
          `the slug "${guide.slug}" already belongs to the guide ${other.file}; a guide is cited by its slug alone`,
        ),
      )
    else first.set(guide.slug, guide)
  }
  return errors
}

export function link(items: ParsedItems): Linked {
  const errors: Problem[] = []
  const factSheetBySlug = new Map(items.factSheets.map((f) => [f.slug, f]))
  const tipBySlug = new Map(items.tips.map((d) => [d.slug, d]))
  const guideBySlug = new Map(items.guides.map((g) => [g.slug, g]))
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

  errors.push(...topicsAndGuides(items))
  for (const topic of items.topics) {
    checkTips(topic.file, 'takeaways', topic.takeaways)
    for (const [field, text] of [
      ['opening', topic.opening],
      [TOPIC_SECTIONS.limitations, topic.limitations],
    ] as const) {
      const factSheets = referencesInText(text)
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
  }
  for (const tip of items.tips)
    missingFactSheet(tip.file, 'fact_sheets', tip.fact_sheets)
  for (const guide of items.guides) {
    for (const { field, factSheets } of guideCitations(guide)) {
      missingFactSheet(guide.file, field, factSheets)
      for (const slug of unique(factSheets).filter(isUnverified))
        errors.push(
          problem(
            guide.file,
            `cites the fact sheet "${slug}", ${ONLY_VERIFIED}`,
            field,
          ),
        )
    }
    checkTips(guide.file, 'tips', guide.tips)
    guide.findings.forEach((finding, i) =>
      checkTips(guide.file, `findings.${i}.tips`, finding.tips ?? []),
    )
    const citations = guideCitations(guide)
    if (citations.every((c) => c.factSheets.length === 0))
      errors.push(problem(guide.file, 'the guide cites no fact sheet'))
    // The Limitations say what the answer does not cover: a strong study
    // cited there does not back the answer.
    const backing = citations
      .filter((c) => c.field !== GUIDE_SECTIONS.limitations)
      .flatMap((c) => c.factSheets)
    errors.push(...confidenceCeiling(guide, factSheetsOf(backing)))
    if ((RESERVED_ANCHORS as ReadonlyArray<string>).includes(guide.slug))
      errors.push(
        problem(
          guide.file,
          `a question cannot be called "${guide.slug}": the Guide's page already uses #${guide.slug} (${RESERVED_ANCHORS.join(', ')})`,
        ),
      )
    for (const slug of guide.related)
      if (
        !guideBySlug.has(slug) &&
        ![...items.broken].some(
          (c) => c.startsWith('guides/') && c.endsWith(`/${slug}.md`),
        )
      )
        errors.push(
          problem(
            guide.file,
            `the guide "${slug}" does not exist in guides/`,
            'related',
          ),
        )
  }

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

  const guideOrder = new Map(
    items.topics.flatMap((t, i) =>
      t.order.map((slug, j) => [`${t.slug}/${slug}`, i * 1000 + j] as const),
    ),
  )
  const inOrder = [...items.guides].sort(
    (a, b) =>
      (guideOrder.get(`${a.topic}/${a.slug}`) ?? Infinity) -
        (guideOrder.get(`${b.topic}/${b.slug}`) ?? Infinity) ||
      a.file.localeCompare(b.file),
  )
  const guides: Guide[] = inOrder.map((parsed) => ({
    ...parsed,
    findings: parsed.findings.map((a): GuideFinding => ({
      text: a.text,
      fact_sheets: a.fact_sheets,
      ...inherited(factSheetsOf(a.fact_sheets), a),
      tips: a.tips ?? [],
      myths: a.myths ?? [],
    })),
    citedFactSheets: unique([
      ...sectionFactSheets(parsed, tipBySlug),
      ...referencesInText(parsed.limitations),
    ]),
  }))

  const topics: Topic[] = items.topics.map((topic) => ({
    ...topic,
    citedFactSheets: guideFactSheets(
      topic,
      inOrder.filter((g) => g.topic === topic.slug),
      tipBySlug,
    ),
  }))

  return { topics, guides, tips, errors }
}
