// The Verbetes (#349, GLOSSARY: Verbete): the words a reader can tap to see
// what they mean. Each is a file `terms/<slug>.md`; the text marks a word
// with `[[…]]` (`marks.ts`) on its first use in each Chapter, and a Verbete
// that varies by Study needs the definition of every Fact sheet the
// sentence cites.
import { TermFrontmatter } from './schema.ts'
import { splitFrontmatter } from './markdown.ts'
import { decode, problem, type Problem } from './problems.ts'
import { parse as parseYaml } from 'yaml'
import { formKey, termFinder, TERM_MARK } from './marks.ts'
import { referencesInText } from './publication.ts'
import type { FactSheet } from './fact-sheet.ts'
import type { Question, Tip, Topic } from './items.ts'

export interface Term {
  readonly slug: string
  readonly file: string
  readonly name: string
  /** `name` and the other forms, in file order. */
  readonly forms: ReadonlyArray<string>
  readonly variesByStudy: boolean
  readonly institution: boolean
  /** The general definition, in markdown: our words, with no number. */
  readonly definition: string
}

export type ParsedTerm =
  | { readonly ok: true; readonly term: Term }
  | { readonly ok: false; readonly errors: ReadonlyArray<Problem> }

/** Reads the text of a `terms/<slug>.md` file. */
export function readTerm(file: string, text: string): ParsedTerm {
  const slug = file.replace(/^.*\//, '').replace(/\.md$/, '')
  const errors: Problem[] = []
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    errors.push(
      problem(
        file,
        'the file name must be lowercase, without accents, hyphenated',
      ),
    )
  const { frontmatter, body } = splitFrontmatter(text)
  if (frontmatter === null)
    return {
      ok: false,
      errors: [
        ...errors,
        problem(file, 'missing the frontmatter (the --- block at the top)'),
      ],
    }
  let data: unknown
  try {
    data = parseYaml(frontmatter) ?? {}
  } catch (e) {
    return {
      ok: false,
      errors: [
        ...errors,
        problem(
          file,
          `the frontmatter is not valid YAML: ${(e as Error).message}`,
        ),
      ],
    }
  }
  const decoded = decode(TermFrontmatter, data, file)
  if (!decoded.ok)
    return { ok: false, errors: [...errors, ...decoded.problems] }
  const fm = decoded.value
  const definition = body.trim()
  if (!definition)
    errors.push(problem(file, 'missing the general definition in the body'))
  // A number is a finding, and a finding belongs to a Fact sheet.
  if (/\d/.test(definition))
    errors.push(
      problem(
        file,
        'the general definition carries no number; a number belongs to a Fact sheet, cited in a Guide',
      ),
    )
  if (fm.varies_by_study && fm.institution)
    errors.push(
      problem(
        file,
        'an institution does not vary by Study; choose one of varies_by_study and institution',
      ),
    )
  if (errors.length > 0) return { ok: false, errors }
  return {
    ok: true,
    term: {
      slug,
      file,
      name: fm.name,
      forms: [...new Set([fm.name, ...(fm.forms ?? [])])],
      variesByStudy: fm.varies_by_study ?? false,
      institution: fm.institution ?? false,
      definition,
    },
  }
}

/** One text the reader sees as a whole: the opening of a Guide, a Chapter,
 * a Question's answer, a Tip, the body of a Fact sheet. A Verbete is marked
 * once in each. */
interface Passage {
  readonly file: string
  readonly field: string
  readonly markdown: string
  /** The Fact sheet the passage is in, whose definitions it shows. */
  readonly own?: FactSheet
}

export interface TermSources {
  readonly terms: ReadonlyArray<Term>
  readonly factSheets: ReadonlyArray<FactSheet>
  readonly topics: ReadonlyArray<Topic>
  readonly questions: ReadonlyArray<Question>
  readonly tips: ReadonlyArray<Tip>
}

function passages({
  factSheets,
  topics,
  questions,
  tips,
}: TermSources): Passage[] {
  return [
    ...topics.flatMap((topic) => [
      { file: topic.file, field: 'opening', markdown: topic.opening },
      ...topic.chapters.map((chapter) => ({
        file: topic.file,
        field: chapter.title,
        markdown: chapter.parts
          .flatMap((p) => (p.kind === 'text' ? [p.markdown] : []))
          .join('\n\n'),
      })),
      {
        file: topic.file,
        field: 'O que não se sabe',
        markdown: topic.unknowns,
      },
    ]),
    ...questions.map((q) => ({
      file: q.file,
      field: `questions.${q.slug}.answer`,
      markdown: q.answer,
    })),
    ...tips.map((tip) => ({
      file: tip.file,
      field: 'text',
      markdown: tip.text,
    })),
    ...factSheets.map((factSheet) => ({
      file: factSheet.file,
      field: 'body',
      markdown: [
        factSheet.whatItMeasured,
        factSheet.findingsNotes,
        ...factSheet.otherSections.map((s) => s.markdown),
        factSheet.limitations,
      ].join('\n\n'),
      own: factSheet,
    })),
  ]
}

const blank = (s: string) => ' '.repeat(s.length)

/** What is not prose the reader sees: references, the `{{…}}` marks, a
 * link's address and code. Blanked out in place so positions still line
 * up. */
const prose = (markdown: string) =>
  markdown.replace(/\[@[^\]\s]*\]|\{\{[^}]*\}\}|\]\([^)]*\)|`[^`\n]*`/g, blank)

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Where a form appears as a whole word, ignoring case. */
const formPattern = (form: string) =>
  new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(form)}(?![\\p{L}\\p{N}])`,
    'giu',
  )

const SENTENCE_END = /(?<=[.!?…])\s+/

export interface TermProblems {
  readonly errors: ReadonlyArray<Problem>
  readonly warnings: ReadonlyArray<Problem>
}

/** The rules that cross files: the marks, the definitions in the Fact sheets
 * and the institutions. */
export function termProblems(sources: TermSources): TermProblems {
  const { terms, factSheets } = sources
  const errors: Problem[] = []
  const warnings: Problem[] = []
  const bySlug = new Map(terms.map((t) => [t.slug, t]))
  const find = termFinder(terms)

  const byForm = new Map<string, Term>()
  for (const term of terms)
    for (const form of term.forms) {
      const key = formKey(form)
      const other = byForm.get(key)
      if (other && other !== term)
        errors.push(
          problem(
            term.file,
            `the form "${form}" is already a form of ${other.file}; a word leads to a single Verbete`,
            'forms',
          ),
        )
      else byForm.set(key, term)
    }

  for (const factSheet of factSheets) {
    if (factSheet.institution !== undefined) {
      const term = bySlug.get(factSheet.institution)
      if (!term)
        errors.push(
          problem(
            factSheet.file,
            `the Verbete terms/${factSheet.institution}.md does not exist`,
            'institution',
          ),
        )
      else if (!term.institution)
        errors.push(
          problem(
            factSheet.file,
            `${term.file} is not an institution (institution: true)`,
            'institution',
          ),
        )
    }
    const seen = new Set<string>()
    for (const definition of factSheet.definitions) {
      const term = bySlug.get(definition.term)
      if (!term)
        errors.push(
          problem(
            factSheet.file,
            `the Verbete terms/${definition.term}.md does not exist`,
            'Definições',
          ),
        )
      else if (!term.variesByStudy)
        errors.push(
          problem(
            factSheet.file,
            `${term.file} does not vary by Study (varies_by_study: true), so it has no definition per Fact sheet`,
            'Definições',
          ),
        )
      if (seen.has(definition.term))
        errors.push(
          problem(
            factSheet.file,
            `${definition.term} is defined twice`,
            'Definições',
          ),
        )
      seen.add(definition.term)
    }
  }

  const factSheetBySlug = new Map(factSheets.map((f) => [f.slug, f]))
  const defines = (factSheet: FactSheet, term: Term) =>
    factSheet.definitions.some((d) => d.term === term.slug)

  for (const passage of passages(sources)) {
    const { file, field, markdown, own } = passage
    if (!markdown) continue
    const text = prose(markdown)

    // The marks, then the same words left unmarked.
    const marks: Array<{ index: number; term: Term }> = []
    for (const m of text.matchAll(TERM_MARK)) {
      const [whole, first = '', shown] = m
      const term = find(first, shown)
      if (!term) {
        errors.push(
          problem(
            file,
            shown === undefined
              ? `${whole} is not a form of any Verbete in terms/`
              : `${whole}: the Verbete terms/${first.trim()}.md does not exist`,
            field,
          ),
        )
        continue
      }
      marks.push({ index: m.index, term })
    }
    const unmarked = text.replace(TERM_MARK, blank)

    for (const term of terms) {
      const marked = marks.filter((m) => m.term === term)
      if (marked.length > 1)
        errors.push(
          problem(
            file,
            `${term.name} is marked ${marked.length} times; mark only its first use here`,
            field,
          ),
        )
      const first = marked[0]?.index ?? Infinity
      const before = term.forms.some((form) =>
        [...unmarked.matchAll(formPattern(form))].some((u) => u.index < first),
      )
      if (before)
        warnings.push(
          problem(
            file,
            `the first use of ${term.name} is not marked; write [[${term.name}]] (terms/${term.slug}.md)`,
            field,
          ),
        )
    }

    // The definition of each cited Study, next to a Verbete that varies.
    if (own) {
      for (const { term } of marks)
        if (term.variesByStudy && !defines(own, term))
          errors.push(
            problem(
              file,
              `marks ${term.name}, which varies by Study, and the "## Definições" table does not say how this Study defined it`,
              field,
            ),
          )
      continue
    }
    for (const sentence of markdown.split(SENTENCE_END)) {
      const varying = [...sentence.matchAll(TERM_MARK)]
        .map(([, first = '', shown]) => find(first, shown))
        .filter((t): t is Term => t?.variesByStudy === true)
      if (varying.length === 0) continue
      for (const slug of new Set(referencesInText(sentence))) {
        const factSheet = factSheetBySlug.get(slug)
        if (!factSheet) continue
        for (const term of new Set(varying))
          if (!defines(factSheet, term))
            errors.push(
              problem(
                file,
                `marks ${term.name}, which varies by Study, and cites ${factSheet.file}, whose "## Definições" table does not say how that Study defined it`,
                field,
              ),
            )
      }
    }
  }

  return { errors, warnings }
}
