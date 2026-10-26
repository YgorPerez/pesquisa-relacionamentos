// The Guide and the Tip read file by file: the decoded frontmatter and the
// cut body. What depends on other files (inheritance from the fact sheets,
// references, confidence) lives in `publication.ts`.
import type { Schema } from 'effect'
import { parse as parseYaml } from 'yaml'
import {
  TipFrontmatter,
  GuideFrontmatter,
  type Coverage,
  type Myth,
  type QuestionFrontmatter,
} from './schema.ts'
import { RESERVED_ROUTES, type Strength } from './lists.ts'
import { splitFrontmatter, readBody } from './markdown.ts'
import { decode, problem, type Problem } from './problems.ts'
import { visualPlacementProblems, type Visual } from './visuals.ts'
import { YOU_MARK } from './marks.ts'

/** A piece of a Chapter, in body order: text (which may place Visuals and
 * carry the inline marks), or a line that places a Question's answer, a Tip
 * or a Myth. */
export type ChapterPart =
  | { readonly kind: 'text'; readonly markdown: string }
  | { readonly kind: 'question'; readonly slug: string }
  | { readonly kind: 'tip'; readonly slug: string }
  | { readonly kind: 'myth'; readonly id: string }

/** A step of the Guide's reasoning: one `##` of the body (ADR 0042). */
export interface Chapter {
  /** The anchor, from the title: `#o-online-virou-o-caminho-mais-comum`. */
  readonly id: string
  readonly title: string
  readonly parts: ReadonlyArray<ChapterPart>
}

/** A finding with what it inherited from the cited fact sheets. The
 * inherited keys keep the frontmatter names. */
export interface GuideFinding {
  readonly id: string
  readonly text: string
  readonly fact_sheets: ReadonlyArray<string>
  /** The finding's `country` or the fact sheets' countries, without repeats. */
  readonly countries: ReadonlyArray<string>
  /** The finding's `period` or the fact sheets' periods, joined. */
  readonly period: string
  /** Who the finding covers: `[applies_to]` if it declared a scope, otherwise
   * the `covers` of each cited fact sheet. It applies to the profile any of
   * them covers. */
  readonly covers: ReadonlyArray<Coverage>
  /** Whether `covers` came from `applies_to` (a scope) and not from the fact
   * sheets. */
  readonly scoped: boolean
}

/** A Topic and its Guide, read from `guides/<topic>.md` (ADR 0042). */
export interface Topic {
  /** The file name, which becomes the path `/<topic>`. */
  readonly slug: string
  readonly file: string
  readonly title: string
  readonly position: number
  readonly previous?: ReadonlyArray<string>
  readonly seo?: GuideFrontmatter['seo']
  /** The opening paragraph, in markdown: the body before the first `##`. */
  readonly opening: string
  readonly chapters: ReadonlyArray<Chapter>
  /** "O que não se sabe", in markdown; empty while a Topic waits for its
   * rewrite (ADR 0042, migration). */
  readonly unknowns: string
  /** The Questions' slugs, in the order "Em resumo" lists them. */
  readonly questions: ReadonlyArray<string>
  readonly findings: ReadonlyArray<GuideFinding>
  readonly myths: ReadonlyArray<Myth>
  readonly visuals: ReadonlyArray<Visual>
  /** The "O que levar" Tips, in the file's order. */
  readonly takeaways: ReadonlyArray<string>
  /** Questions of other Topics. */
  readonly related: ReadonlyArray<string>
  /** Every fact sheet the page cites, in page order: the opening, each
   * Chapter (its text, the answers, Tips and Myths it places), "O que levar"
   * and "O que não se sabe". Reference N on the page leads to item N. */
  readonly citedFactSheets: ReadonlyArray<string>
}

/** One Question of a Topic's Guide, answered in one of its Chapters. */
export interface Question extends Omit<QuestionFrontmatter, 'findings'> {
  readonly topic: string
  readonly file: string
  /** The Chapter that answers it. */
  readonly chapter: string
  /** The findings the answer rests on, in the order the Question names
   * them. */
  readonly findings: ReadonlyArray<GuideFinding>
  /** The fact sheets of the answer, of its findings and of the Chapter that
   * answers it, without repeats: the Fact sheet's page lists the Question
   * among the places that cite it. */
  readonly citedFactSheets: ReadonlyArray<string>
}

export interface Tip {
  readonly slug: string
  readonly file: string
  readonly text: string
  readonly fact_sheets: ReadonlyArray<string>
  readonly strength: Strength
  readonly inference: boolean
  readonly countries: ReadonlyArray<string>
  readonly period: string
  readonly covers: ReadonlyArray<Coverage>
  readonly scoped: boolean
  /** A tip only goes to the site if all its fact sheets are ✅ or 🟡. */
  readonly published: boolean
  readonly previous?: ReadonlyArray<string>
  readonly seo?: TipFrontmatter['seo']
}

/** The last `##` of a Guide, which the page shows after "O que levar". */
export const UNKNOWNS_TITLE = 'O que não se sabe'

/** The ids the Guide's page uses for its own blocks: a Question's slug and a
 * Chapter's anchor cannot be one of them. */
export const RESERVED_ANCHORS = [
  'capitulos',
  'em-resumo',
  'perfil',
  'o-que-levar',
  'o-que-nao-se-sabe',
  'fichas',
  'ajudou',
  'outros-temas',
] as const

/** A line that places a block: `{{question:<slug>}}`, `{{tip:<slug>}}` or
 * `{{myth:<id>}}`. */
const BLOCK_LINE = /^\{\{(question|tip|myth):([a-z0-9]+(?:-[a-z0-9]+)*)\}\}$/
const ANY_MARK = /\{\{[^}]*\}\}/g
const KNOWN_INLINE =
  /^\{\{(?:brazil|you:[a-z0-9]+(?:-[a-z0-9]+)*|visual:[a-z0-9]+(?:-[a-z0-9]+)*)\}\}$/

/** A Chapter heading may end in its own anchor, `## Title {#anchor}`, for
 * when the title alone would repeat a Question's slug. */
const OWN_ANCHOR = /\s*\{#([a-z0-9]+(?:-[a-z0-9]+)*)\}$/

/** A Chapter's title and anchor: the one the heading gives, or the title
 * without accents, lowercase, hyphenated. */
export function chapterHeading(heading: string): {
  readonly id: string
  readonly title: string
} {
  const own = OWN_ANCHOR.exec(heading)
  const title = heading.replace(OWN_ANCHOR, '')
  return {
    title,
    id:
      own?.[1] ??
      title
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
  }
}

/** Cuts a Chapter's markdown at the lines that place a block. */
export function chapterParts(markdown: string): ChapterPart[] {
  const parts: ChapterPart[] = []
  let text: string[] = []
  const flush = () => {
    const joined = text.join('\n').trim()
    if (joined) parts.push({ kind: 'text', markdown: joined })
    text = []
  }
  for (const line of markdown.split('\n')) {
    const block = BLOCK_LINE.exec(line.trim())
    if (!block) {
      text.push(line)
      continue
    }
    flush()
    const [, kind, id = ''] = block
    parts.push(
      kind === 'myth'
        ? { kind: 'myth', id }
        : { kind: kind === 'tip' ? 'tip' : 'question', slug: id },
    )
  }
  flush()
  return parts
}

type Parsed<T> = {
  readonly value: T | null
  readonly body: string
  readonly errors: Problem[]
}

function readFrontmatter<S extends Schema.Decoder<unknown>>(
  schema: S,
  file: string,
  text: string,
): Parsed<S['Type']> {
  const errors: Problem[] = []
  const { frontmatter, body } = splitFrontmatter(text)
  if (frontmatter === null) {
    errors.push(
      problem(file, 'missing the frontmatter (the --- block at the top)'),
    )
    return { value: null, body, errors }
  }
  let data: unknown
  try {
    data = parseYaml(frontmatter) ?? {}
  } catch (e) {
    errors.push(
      problem(
        file,
        `the frontmatter is not valid YAML: ${(e as Error).message}`,
      ),
    )
    return { value: null, body, errors }
  }
  const decoded = decode(schema, data, file)
  if (!decoded.ok) return { value: null, body, errors: [...decoded.problems] }
  return { value: decoded.value, body, errors }
}

const nameWithoutMd = (file: string) =>
  file.replace(/^.*\//, '').replace(/\.md$/, '')

export type ParsedItem<T> =
  | { readonly ok: true; readonly item: T }
  | { readonly ok: false; readonly errors: ReadonlyArray<Problem> }

/** The Topic before `publication.ts` adds what depends on other files. */
export type ParsedTopic = Omit<Topic, 'findings' | 'citedFactSheets'> & {
  readonly findings: GuideFrontmatter['findings']
}

/** The Question before `publication.ts` links its findings. */
export type ParsedQuestion = QuestionFrontmatter & {
  readonly topic: string
  readonly file: string
  readonly chapter: string
}

export interface ParsedGuide {
  readonly topic: ParsedTopic
  readonly questions: ReadonlyArray<ParsedQuestion>
}

const repeated = (list: ReadonlyArray<string>) => [
  ...new Set(list.filter((x, i) => list.indexOf(x) !== i)),
]

/** The marks of a text: block lines only in a Chapter, the known inline
 * marks in the body, and none in a short answer. */
function markProblems(
  file: string,
  field: string,
  markdown: string,
  where: 'chapter' | 'body' | 'answer',
): Problem[] {
  const errors: Problem[] = []
  for (const line of markdown.split('\n'))
    if (where !== 'chapter' && BLOCK_LINE.test(line.trim()))
      errors.push(
        problem(
          file,
          `"${line.trim()}" places a block, which only goes inside a Chapter`,
          field,
        ),
      )
  for (const [mark] of markdown.matchAll(ANY_MARK)) {
    if (BLOCK_LINE.test(mark)) continue
    if (where === 'answer')
      errors.push(
        problem(
          file,
          `"${mark}": the answer stays plain text, which "Em resumo" and the search also show`,
          field,
        ),
      )
    else if (!KNOWN_INLINE.test(mark))
      errors.push(
        problem(
          file,
          `unknown mark "${mark}"; the body knows {{question:…}}, {{tip:…}}, {{myth:…}}, {{visual:…}}, {{brazil}} and {{you:<finding>}}`,
          field,
        ),
      )
  }
  return errors
}

/** `guides/<topic>.md`: the Topic, its Guide and its Questions. */
export function readGuide(file: string, text: string): ParsedItem<ParsedGuide> {
  const slug = nameWithoutMd(file)
  const { value, body, errors } = readFrontmatter(GuideFrontmatter, file, text)
  const parsed = readBody(body)
  if (parsed.title)
    errors.push(
      problem(file, 'a Guide has no "#" title: the title comes from `title`'),
    )
  if (!parsed.opening)
    errors.push(
      problem(file, 'missing the opening paragraph before the first "##"'),
    )

  const unknownsAt = parsed.sections.findIndex(
    (s) => s.title === UNKNOWNS_TITLE,
  )
  if (unknownsAt !== -1 && unknownsAt !== parsed.sections.length - 1)
    errors.push(
      problem(
        file,
        `"## ${UNKNOWNS_TITLE}" is the last section of the Guide`,
        UNKNOWNS_TITLE,
      ),
    )
  const unknowns =
    unknownsAt === -1 ? '' : (parsed.sections[unknownsAt]?.markdown ?? '')
  if (unknownsAt !== -1 && !unknowns)
    errors.push(
      problem(
        file,
        `the section "## ${UNKNOWNS_TITLE}" is empty`,
        UNKNOWNS_TITLE,
      ),
    )
  const sections = parsed.sections.filter((s) => s.title !== UNKNOWNS_TITLE)
  if (sections.length === 0)
    errors.push(problem(file, 'a Guide has at least one Chapter ("## …")'))

  const chapters: Chapter[] = sections.map((s) => ({
    ...chapterHeading(s.title),
    parts: chapterParts(s.markdown),
  }))
  for (const [i, section] of sections.entries()) {
    const chapter = chapters[i]
    if (!chapter) continue
    if (!section.markdown)
      errors.push(
        problem(
          file,
          `the Chapter "## ${section.title}" is empty`,
          section.title,
        ),
      )
    if (!chapter.id)
      errors.push(
        problem(
          file,
          `the Chapter "## ${section.title}" needs letters or digits in its title, which become its anchor`,
          section.title,
        ),
      )
    errors.push(
      ...markProblems(file, section.title, section.markdown, 'chapter'),
    )
  }
  errors.push(...markProblems(file, 'opening', parsed.opening, 'body'))
  errors.push(...markProblems(file, UNKNOWNS_TITLE, unknowns, 'body'))

  const reserved: ReadonlyArray<string> = RESERVED_ROUTES
  if (reserved.includes(slug))
    errors.push(
      problem(
        file,
        `a topic cannot be called "${slug}", which is a site route (${RESERVED_ROUTES.join(', ')})`,
      ),
    )
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    errors.push(
      problem(
        file,
        'the Guide file name must be lowercase, without accents, hyphenated',
      ),
    )

  if (value) errors.push(...frontmatterProblems(file, value, chapters, body))
  if (!value || errors.length > 0) return { ok: false, errors }

  const chapterOf = new Map(
    chapters.flatMap((c) =>
      c.parts.flatMap((p) => (p.kind === 'question' ? [[p.slug, c.id]] : [])),
    ) as Array<[string, string]>,
  )
  return {
    ok: true,
    item: {
      topic: {
        slug,
        file,
        title: value.title,
        position: value.position,
        ...(value.previous ? { previous: value.previous } : {}),
        ...(value.seo ? { seo: value.seo } : {}),
        opening: parsed.opening,
        chapters,
        unknowns,
        questions: value.questions.map((q) => q.slug),
        findings: value.findings,
        myths: value.myths ?? [],
        visuals: value.visuals ?? [],
        takeaways: value.takeaways ?? [],
        related: value.related ?? [],
      },
      questions: value.questions.map((q) => ({
        ...q,
        topic: slug,
        file,
        chapter: chapterOf.get(q.slug) ?? '',
      })),
    },
  }
}

/** What the frontmatter and the body must agree on: each Question and Myth
 * placed once, each finding a Question names declared, each anchor free. */
function frontmatterProblems(
  file: string,
  value: GuideFrontmatter,
  chapters: ReadonlyArray<Chapter>,
  body: string,
): Problem[] {
  const errors: Problem[] = []
  const err = (message: string, field?: string) =>
    errors.push(problem(file, message, field))
  const questionSlugs = value.questions.map((q) => q.slug)
  const findingIds = value.findings.map((f) => f.id)
  const mythIds = (value.myths ?? []).map((m) => m.id)
  for (const slug of repeated(questionSlugs))
    err(`the Question "${slug}" is declared twice`, 'questions')
  for (const id of repeated(findingIds))
    err(`the finding "${id}" is declared twice`, 'findings')
  for (const id of repeated(mythIds))
    err(`the Myth "${id}" is declared twice`, 'myths')
  if (value.questions.length === 0)
    err('a Guide answers at least one Question', 'questions')

  value.questions.forEach((q, i) => {
    const field = `questions.${i}`
    if ((q.question.match(/==[^=]+==/g) ?? []).length > 1)
      err(
        'the question highlights at most one word in yellow (==word==)',
        `${field}.question`,
      )
    errors.push(...markProblems(file, `${field}.answer`, q.answer, 'answer'))
    if (q.findings.length === 0)
      err(
        'the answer rests on at least one finding: name it in `findings`',
        `${field}.findings`,
      )
    for (const id of q.findings)
      if (!findingIds.includes(id))
        err(
          `the finding "${id}" is not declared in \`findings\``,
          `${field}.findings`,
        )
    if ((RESERVED_ANCHORS as ReadonlyArray<string>).includes(q.slug))
      err(
        `a question cannot be called "${q.slug}": the Guide's page already uses #${q.slug} (${RESERVED_ANCHORS.join(', ')})`,
        `${field}.slug`,
      )
  })

  const placed = chapters.flatMap((c) => c.parts)
  const count = (kind: 'question' | 'myth', id: string) =>
    placed.filter(
      (p) => p.kind === kind && (p.kind === 'myth' ? p.id : p.slug) === id,
    ).length
  for (const slug of questionSlugs) {
    const n = count('question', slug)
    if (n === 0)
      err(
        `the Question "${slug}" is not answered in the body; put {{question:${slug}}} on a line of its own in the Chapter where it fits`,
        'questions',
      )
    else if (n > 1) err(`the body answers the Question "${slug}" ${n} times`)
  }
  for (const id of mythIds) {
    const n = count('myth', id)
    if (n === 0)
      err(
        `the Myth "${id}" is declared and not placed; put {{myth:${id}}} on a line of its own in a Chapter`,
        'myths',
      )
    else if (n > 1) err(`the body places the Myth "${id}" ${n} times`)
  }
  for (const part of placed) {
    if (part.kind === 'question' && !questionSlugs.includes(part.slug))
      err(
        `the body answers the Question "${part.slug}", which \`questions\` does not declare`,
      )
    if (part.kind === 'myth' && !mythIds.includes(part.id))
      err(
        `the body places the Myth "${part.id}", which \`myths\` does not declare`,
      )
  }
  for (const [, id = ''] of body.matchAll(YOU_MARK))
    if (!findingIds.includes(id))
      err(`{{you:${id}}} names a finding that \`findings\` does not declare`)

  const anchors = chapters.map((c) => c.id)
  for (const id of repeated(anchors))
    err(`two Chapters have the anchor #${id}; give one of them another title`)
  for (const id of anchors) {
    if ((RESERVED_ANCHORS as ReadonlyArray<string>).includes(id))
      err(
        `the Chapter anchor #${id} is one of the page's own (${RESERVED_ANCHORS.join(', ')}); change the title`,
      )
    if (questionSlugs.includes(id))
      err(
        `the Chapter anchor #${id} is also a Question's slug; change the title`,
      )
  }

  // The Visuals (#182): each one declared is placed once in the body.
  errors.push(...visualPlacementProblems(file, value.visuals ?? [], body))
  return errors
}

export type ParsedTip = TipFrontmatter & {
  readonly slug: string
  readonly file: string
  readonly text: string
}

/** `tips/<slug>.md`. */
export function readTip(file: string, text: string): ParsedItem<ParsedTip> {
  const slug = nameWithoutMd(file)
  const { value, body, errors } = readFrontmatter(TipFrontmatter, file, text)
  const tipText = body.trim()
  if (value && !tipText)
    errors.push(problem(file, 'missing the tip text in the body'))
  if (value && value.fact_sheets.length === 0)
    errors.push(
      problem(file, 'a tip cites at least one fact sheet', 'fact_sheets'),
    )
  if (value?.inference && value.strength === 'strong')
    errors.push(
      problem(
        file,
        `an inference has at most moderate strength (got ${value.strength})`,
        'strength',
      ),
    )
  if (!value || errors.length > 0) return { ok: false, errors }
  return { ok: true, item: { ...value, slug, file, text: tipText } }
}

export type { Myth }
