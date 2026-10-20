// A fact sheet: the decoded frontmatter plus the body cut into the sections
// the site draws (O que mediu, Achados, Limitações). The section and column
// headings are the content contract and stay in Portuguese.
import { parse as parseYaml } from 'yaml'
import { FactSheetFrontmatter } from './schema.ts'
import {
  splitFrontmatter,
  readBody,
  firstTable,
  type Section,
} from './markdown.ts'
import { decode, problem, type Problem } from './problems.ts'

/** A row of the Achados table. */
export interface Finding {
  readonly measure: string
  readonly value: string
  /** The locator in the original: page, table, section. */
  readonly locator: string
  /** The literal excerpt from the original, or `null` until someone checks it. */
  readonly excerpt: string | null
  /** The script that reproduces a computed number (#6). */
  readonly calculation: string | null
}

export interface FactSheet extends FactSheetFrontmatter {
  /** The file name without `.md`, which becomes the path `/estudos/<slug>`. */
  readonly slug: string
  /** Path of the file from the repository root. */
  readonly file: string
  /** The body's `#`: "Autor (ano): tema". */
  readonly title: string
  /** The DOI taken from `link`, lowercased, or `null` if the link is not a DOI. */
  readonly doi: string | null
  readonly whatItMeasured: string
  readonly findings: ReadonlyArray<Finding>
  /** The markdown of the Achados section outside the table (notes before and
   * after). */
  readonly findingsNotes: string
  /** Extra sections, between Achados and Limitações, in file order. */
  readonly otherSections: ReadonlyArray<Section>
  readonly limitations: string
  /** Only for reports and internal research; the site does not show it. */
  readonly howWeUseIt: string | null
}

export const SECTIONS = {
  whatItMeasured: 'O que mediu',
  findings: 'Achados',
  limitations: 'Limitações',
  howWeUseIt: 'Como usamos',
} as const

const COLUMNS = ['Medida', 'Valor', 'Onde', 'Trecho'] as const
const CALCULATION_COLUMN = 'Cálculo'

export function doiFromLink(link: string): string | null {
  const match = /^https?:\/\/(?:dx\.)?doi\.org\/(10\.\S+)$/i.exec(link)
  return match?.[1] ? decodeURIComponent(match[1]).toLowerCase() : null
}

export type ParsedFactSheet =
  | { readonly ok: true; readonly factSheet: FactSheet }
  | { readonly ok: false; readonly errors: ReadonlyArray<Problem> }

/** Reads the text of an `estudos/<slug>.md` file. */
export function readFactSheet(file: string, text: string): ParsedFactSheet {
  const slug = file.replace(/^.*\//, '').replace(/\.md$/, '')
  const errors: Problem[] = []
  const { frontmatter, body } = splitFrontmatter(text)

  let data: unknown = null
  if (frontmatter === null) {
    errors.push(
      problem(file, 'missing the frontmatter (the --- block at the top)'),
    )
  } else {
    try {
      data = parseYaml(frontmatter) ?? {}
    } catch (e) {
      errors.push(
        problem(
          file,
          `the frontmatter is not valid YAML: ${(e as Error).message}`,
        ),
      )
    }
  }

  const decoded =
    data === null ? null : decode(FactSheetFrontmatter, data, file)
  if (decoded && !decoded.ok) errors.push(...decoded.problems)

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    errors.push(
      problem(
        file,
        'the file name must be lowercase, without accents, hyphenated',
      ),
    )

  const parsed = readBody(body)
  if (!parsed.title)
    errors.push(
      problem(file, 'missing the title "# Autor (ano): tema" in the body'),
    )

  const section = (title: string) =>
    parsed.sections.find((s) => s.title === title)
  for (const title of [
    SECTIONS.whatItMeasured,
    SECTIONS.findings,
    SECTIONS.limitations,
  ]) {
    if (!section(title))
      errors.push(problem(file, `missing the section "## ${title}"`, title))
  }

  const findings: Finding[] = []
  let findingsNotes = ''
  const findingsSection = section(SECTIONS.findings)
  if (findingsSection) {
    const table = firstTable(findingsSection.markdown)
    const expected = COLUMNS.join(' | ')
    if (!table) {
      errors.push(
        problem(file, `missing the table | ${expected} |`, SECTIONS.findings),
      )
    } else {
      const header = table.header
      const valid =
        COLUMNS.every((c, i) => header[i] === c) &&
        (header.length === COLUMNS.length ||
          (header.length === COLUMNS.length + 1 &&
            header[4] === CALCULATION_COLUMN))
      if (!valid) {
        errors.push(
          problem(
            file,
            `the table needs the columns | ${expected} | (and an optional | ${CALCULATION_COLUMN} |), got | ${header.join(' | ')} |`,
            SECTIONS.findings,
          ),
        )
      } else {
        table.rows.forEach((row, i) => {
          const [
            measure = '',
            value = '',
            locator = '',
            excerpt = '',
            calculation = '',
          ] = row
          if (!measure || !value)
            errors.push(
              problem(
                file,
                `row ${i + 1} of the table needs Medida and Valor`,
                SECTIONS.findings,
              ),
            )
          findings.push({
            measure,
            value,
            locator,
            excerpt: excerpt || null,
            calculation: calculation || null,
          })
        })
      }
      findingsNotes = [table.before, table.after].filter(Boolean).join('\n\n')
    }
  }

  if (decoded?.ok) {
    const fm = decoded.value
    if (fm.status !== 'nao-verificado') {
      if (!fm.verificado_em)
        errors.push(
          problem(
            file,
            'an ok or partial fact sheet needs the date it was checked',
            'verificado_em',
          ),
        )
    }
    if (fm.status === 'ok') {
      findings.forEach((finding, i) => {
        if (!finding.excerpt)
          errors.push(
            problem(
              file,
              `row ${i + 1} ("${finding.measure}") has no Trecho; an ok fact sheet quotes the original in every finding`,
              SECTIONS.findings,
            ),
          )
      })
    }
    const ages = fm.cobre.idades
    if (ages && ages.min > ages.max)
      errors.push(
        problem(
          file,
          `min (${ages.min}) is above max (${ages.max})`,
          'cobre.idades',
        ),
      )
  }

  if (errors.length > 0 || !decoded?.ok || !parsed.title)
    return { ok: false, errors }

  const known: ReadonlyArray<string> = Object.values(SECTIONS)
  return {
    ok: true,
    factSheet: {
      ...decoded.value,
      slug,
      file,
      title: parsed.title,
      doi: doiFromLink(decoded.value.link),
      whatItMeasured: section(SECTIONS.whatItMeasured)?.markdown ?? '',
      findings,
      findingsNotes,
      otherSections: parsed.sections.filter((s) => !known.includes(s.title)),
      limitations: section(SECTIONS.limitations)?.markdown ?? '',
      howWeUseIt: section(SECTIONS.howWeUseIt)?.markdown ?? null,
    },
  }
}
