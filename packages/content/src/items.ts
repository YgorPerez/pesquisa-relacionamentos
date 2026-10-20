// Topic, guide and tip read file by file: the decoded frontmatter and the cut
// body. What depends on other files (inheritance from the fact sheets,
// references, confidence, `order`) lives in `publication.ts`.
import type { Schema } from 'effect'
import { parse as parseYaml } from 'yaml'
import {
  TipFrontmatter,
  GuideFrontmatter,
  TopicFrontmatter,
  type Coverage,
  type Divergence,
  type Myth,
} from './schema.ts'
import { RESERVED_ROUTES, type Strength } from './lists.ts'
import { splitFrontmatter, readBody } from './markdown.ts'
import { decode, problem, type Problem } from './problems.ts'

export interface Topic extends TopicFrontmatter {
  /** The folder name in `guides/`, which becomes the path `/<topic>`. */
  readonly slug: string
  readonly file: string
  /** The context paragraph, in markdown. */
  readonly context: string
}

/** A guide finding with what it inherited from the cited fact sheets. The
 * inherited keys keep the frontmatter names. */
export interface GuideFinding {
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

export interface Guide extends Omit<
  GuideFrontmatter,
  'findings' | 'tips' | 'myths' | 'related'
> {
  readonly slug: string
  /** The topic slug, the file's folder. */
  readonly topic: string
  readonly file: string
  readonly findings: ReadonlyArray<GuideFinding>
  readonly tips: ReadonlyArray<string>
  readonly myths: ReadonlyArray<Myth>
  readonly related: ReadonlyArray<string>
  /** The markdown before the first `##`. References like `[@fact-sheet-slug]`
   * and the key number like `==39% dos casais==`. */
  readonly shortAnswer: string
  readonly variesByProfile: string
  readonly limitations: string
  /** Every fact sheet the page cites, in the order they appear; each
   * reference's number is its position here plus one. */
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

export const GUIDE_SECTIONS = {
  profile: 'Varia conforme o Perfil?',
  limitations: 'Limitações',
} as const

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

/** `guides/<topic>/_topic.md`. */
export function readTopic(file: string, text: string): ParsedItem<Topic> {
  const slug = file.split('/')[1] ?? ''
  const { value, body, errors } = readFrontmatter(TopicFrontmatter, file, text)
  const context = body.trim()
  if (value && !context)
    errors.push(problem(file, 'missing the context paragraph in the body'))
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
        'the topic folder name must be lowercase, without accents, hyphenated',
      ),
    )
  if (!value || errors.length > 0) return { ok: false, errors }
  return { ok: true, item: { ...value, slug, file, context } }
}

/** The guide still without the fact sheets' inheritance: the findings'
 * `countries`, `period` and `covers`, and `citedFactSheets`, arrive in
 * `publication.ts`. */
export type ParsedGuide = Omit<Guide, 'findings' | 'citedFactSheets'> & {
  readonly findings: GuideFrontmatter['findings']
}

/** `guides/<topic>/<slug>.md`. */
export function readGuide(file: string, text: string): ParsedItem<ParsedGuide> {
  const [, topic = '', name = ''] = file.split('/')
  const slug = nameWithoutMd(name)
  const { value, body, errors } = readFrontmatter(GuideFrontmatter, file, text)
  const parsed = readBody(body)
  if (parsed.title)
    errors.push(
      problem(
        file,
        'a guide has no "#" title: the question comes from `question`',
      ),
    )
  if (!parsed.opening)
    errors.push(problem(file, 'missing the short answer before the first "##"'))
  const known: ReadonlyArray<string> = Object.values(GUIDE_SECTIONS)
  for (const title of known) {
    if (!parsed.sections.some((s) => s.title === title))
      errors.push(problem(file, `missing the section "## ${title}"`, title))
  }
  for (const section of parsed.sections) {
    if (!known.includes(section.title))
      errors.push(
        problem(
          file,
          `unknown section "## ${section.title}"; a guide body has only the short answer, "## ${GUIDE_SECTIONS.profile}" and "## ${GUIDE_SECTIONS.limitations}"`,
          section.title,
        ),
      )
  }
  if (value) {
    const highlights = value.question.match(/==[^=]+==/g) ?? []
    if (highlights.length > 1)
      errors.push(
        problem(
          file,
          'the question highlights at most one word in yellow (==word==)',
          'question',
        ),
      )
  }
  if (!value || errors.length > 0) return { ok: false, errors }
  const section = (title: string) =>
    parsed.sections.find((s) => s.title === title)?.markdown ?? ''
  return {
    ok: true,
    item: {
      ...value,
      slug,
      topic,
      file,
      tips: value.tips ?? [],
      myths: value.myths ?? [],
      related: value.related ?? [],
      shortAnswer: parsed.opening,
      variesByProfile: section(GUIDE_SECTIONS.profile),
      limitations: section(GUIDE_SECTIONS.limitations),
    },
  }
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

export type { Divergence, Myth }
