// What links the files: guides and tips inherit country, period and `cobre`
// from the cited fact sheets, and the publication rules of #7 and #10 stop
// the build.
import type { Coverage } from './schema.ts'
import type { FactSheet } from './fact-sheet.ts'
import {
  GUIDE_SECTIONS,
  type GuideFinding,
  type Tip,
  type ParsedTip,
  type Guide,
  type ParsedGuide,
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
  own: { pais?: string; periodo?: string; vale_para?: Coverage },
) {
  return {
    paises: own.pais ? [own.pais] : unique(factSheets.flatMap((f) => f.paises)),
    periodo: own.periodo ?? unique(factSheets.map((f) => f.periodo)).join('; '),
    cobre: own.vale_para ? [own.vale_para] : factSheets.map((f) => f.cobre),
    scoped: own.vale_para !== undefined,
  }
}

export interface ParsedItems {
  readonly factSheets: ReadonlyArray<FactSheet>
  readonly topics: ReadonlyArray<Topic>
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

/** A guide's fact sheets in page order: short answer, tips, findings,
 * divergence, profile, myths and limitations. */
function factSheetsInPageOrder(
  guide: ParsedGuide,
  tips: ReadonlyMap<string, ParsedTip>,
): string[] {
  return unique([
    ...referencesInText(guide.shortAnswer),
    ...guide.dicas.flatMap((slug) => tips.get(slug)?.fichas ?? []),
    ...guide.achados.flatMap((a) => [
      ...referencesInText(a.texto),
      ...a.fichas,
    ]),
    ...(guide.divergencia?.lados.flatMap((l) => [
      ...referencesInText(l.texto),
      ...l.fichas,
    ]) ?? []),
    ...referencesInText(guide.variesByProfile),
    ...guide.mitos.flatMap((m) => [
      ...referencesInText(m.por_que_nao),
      ...m.fichas,
    ]),
    ...referencesInText(guide.limitations),
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
    ...guide.achados.flatMap((a, i) => [
      { field: `achados.${i}.texto`, factSheets: referencesInText(a.texto) },
      { field: `achados.${i}.fichas`, factSheets: a.fichas },
    ]),
    ...(guide.divergencia?.lados.flatMap((l, i) => [
      {
        field: `divergencia.lados.${i}.texto`,
        factSheets: referencesInText(l.texto),
      },
      { field: `divergencia.lados.${i}.fichas`, factSheets: l.fichas },
    ]) ?? []),
    {
      field: GUIDE_SECTIONS.profile,
      factSheets: referencesInText(guide.variesByProfile),
    },
    ...guide.mitos.flatMap((m, i) => [
      {
        field: `mitos.${i}.por_que_nao`,
        factSheets: referencesInText(m.por_que_nao),
      },
      { field: `mitos.${i}.fichas`, factSheets: m.fichas },
    ]),
    {
      field: GUIDE_SECTIONS.limitations,
      factSheets: referencesInText(guide.limitations),
    },
  ]
}

const RANK: Record<Strength, number> = { fraca: 1, moderada: 2, forte: 3 }

/** The confidence never goes above the strongest fact sheet backing the
 * answer, and stays at moderate at most when all of them are 🟡 (#7). Tips do
 * not count: each one carries its own strength. */
function confidenceCeiling(
  guide: ParsedGuide,
  cited: ReadonlyArray<FactSheet>,
): Problem[] {
  const factSheets = cited.filter((f) => f.status !== 'nao-verificado')
  if (factSheets.length === 0) return []
  const confidence = RANK[guide.confianca]
  const strongest = factSheets.reduce((a, b) =>
    RANK[b.forca] > RANK[a.forca] ? b : a,
  )
  if (confidence > RANK[strongest.forca])
    return [
      problem(
        guide.file,
        `the confidence (${guide.confianca}) is above the strongest fact sheet the guide cites (${strongest.forca})`,
        'confianca',
      ),
    ]
  if (
    confidence > RANK.moderada &&
    factSheets.every((f) => f.status === 'parcial')
  )
    return [
      problem(
        guide.file,
        `the confidence (${guide.confianca}) is above moderate, and the guide only cites partial (🟡) fact sheets`,
        'confianca',
      ),
    ]
  return []
}

/** Each guide folder has a `_tema.md` whose `ordem` lists the folder's guides,
 * each one once; a guide's slug is unique across the site. */
function topicsAndGuides(items: ParsedItems): Problem[] {
  const errors: Problem[] = []
  const topics = new Map(items.topics.map((t) => [t.slug, t]))
  for (const topic of unique(items.guides.map((g) => g.topic)))
    if (!topics.has(topic) && !items.broken.has(`guias/${topic}/_tema.md`))
      errors.push(
        problem(
          `guias/${topic}`,
          'missing the _tema.md with the title and the order of the guides',
        ),
      )

  for (const topic of items.topics) {
    const parsedInFolder = items.guides
      .filter((g) => g.topic === topic.slug)
      .map((g) => g.slug)
    const inFolder = [
      ...parsedInFolder,
      ...[...items.broken].flatMap((c) => {
        const match = new RegExp(
          `^guias/${topic.slug}/([^_/][^/]*)\\.md$`,
        ).exec(c)
        return match?.[1] ? [match[1]] : []
      }),
    ]
    for (const slug of parsedInFolder)
      if (!topic.ordem.includes(slug))
        errors.push(
          problem(
            topic.file,
            `the guide "${slug}" is in the folder and missing from the order`,
            'ordem',
          ),
        )
    topic.ordem.forEach((slug, i) => {
      if (topic.ordem.indexOf(slug) !== i)
        errors.push(
          problem(
            topic.file,
            `the guide "${slug}" appears more than once`,
            'ordem',
          ),
        )
      else if (!inFolder.includes(slug))
        errors.push(
          problem(
            topic.file,
            `the guide "${slug}" does not exist in guias/${topic.slug}/`,
            'ordem',
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
      if (!factSheetBySlug.has(slug) && !items.broken.has(`estudos/${slug}.md`))
        errors.push(
          problem(
            file,
            `the fact sheet "${slug}" does not exist in estudos/`,
            field,
          ),
        )
  }

  const isUnverified = (slug: string) =>
    factSheetBySlug.get(slug)?.status === 'nao-verificado'
  const ONLY_VERIFIED =
    'which was not verified (⬜); a guide only cites ✅ or 🟡 fact sheets'

  errors.push(...topicsAndGuides(items))
  for (const tip of items.tips) missingFactSheet(tip.file, 'fichas', tip.fichas)
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
    for (const slug of guide.dicas) {
      const tip = tipBySlug.get(slug)
      if (!tip && !items.broken.has(`dicas/${slug}.md`))
        errors.push(
          problem(
            guide.file,
            `the tip "${slug}" does not exist in dicas/`,
            'dicas',
          ),
        )
      for (const factSheet of tip?.fichas.filter(isUnverified) ?? [])
        errors.push(
          problem(
            guide.file,
            `the tip "${slug}" cites the fact sheet "${factSheet}", ${ONLY_VERIFIED}`,
            'dicas',
          ),
        )
    }
    const cited = guideCitations(guide).flatMap((c) => c.factSheets)
    if (cited.length === 0)
      errors.push(problem(guide.file, 'the guide cites no fact sheet'))
    errors.push(...confidenceCeiling(guide, factSheetsOf(cited)))
    for (const slug of guide.relacionadas)
      if (
        !guideBySlug.has(slug) &&
        ![...items.broken].some(
          (c) => c.startsWith('guias/') && c.endsWith(`/${slug}.md`),
        )
      )
        errors.push(
          problem(
            guide.file,
            `the guide "${slug}" does not exist in guias/`,
            'relacionadas',
          ),
        )
  }

  const tips: Tip[] = items.tips.map((parsed) => {
    const factSheets = factSheetsOf(parsed.fichas)
    return {
      slug: parsed.slug,
      file: parsed.file,
      text: parsed.text,
      fichas: parsed.fichas,
      forca: parsed.forca,
      inferencia: parsed.inferencia ?? false,
      ...inherited(factSheets, parsed),
      published:
        factSheets.length === parsed.fichas.length &&
        factSheets.every((f) => f.status !== 'nao-verificado'),
      ...(parsed.antes ? { antes: parsed.antes } : {}),
      ...(parsed.seo ? { seo: parsed.seo } : {}),
    }
  })

  const guideOrder = new Map(
    items.topics.flatMap((t, i) =>
      t.ordem.map((slug, j) => [`${t.slug}/${slug}`, i * 1000 + j] as const),
    ),
  )
  const guides: Guide[] = [...items.guides]
    .sort(
      (a, b) =>
        (guideOrder.get(`${a.topic}/${a.slug}`) ?? Infinity) -
          (guideOrder.get(`${b.topic}/${b.slug}`) ?? Infinity) ||
        a.file.localeCompare(b.file),
    )
    .map((parsed) => ({
      ...parsed,
      achados: parsed.achados.map((a): GuideFinding => ({
        texto: a.texto,
        fichas: a.fichas,
        ...inherited(factSheetsOf(a.fichas), a),
      })),
      citedFactSheets: factSheetsInPageOrder(parsed, tipBySlug),
    }))

  return { topics: items.topics, guides, tips, errors }
}
