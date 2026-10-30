// A Guide's Visuals (#182): data in the frontmatter, placed in the body by
// a line of its own, `{{visual:<id>}}`, and drawn as SVG on the server. Five
// kinds: bar comparison, stacked bars, time line, table of Studies, relation
// diagram.
//
// Every number names where it comes from: a ✅/🟡 Fact sheet whose text has
// that number, or an own calculation ("conta nossa") over such numbers, which
// the build recomputes. A diagram arrow is a finding, so it cites Fact sheets
// too. The checks against the Fact sheets live in `visualProblems`, the ones
// inside one file in `visualPlacementProblems`.
import { Schema } from 'effect'
import { Coverage } from './coverage.ts'
import type { FactSheet } from './fact-sheet.ts'
import { problem, type Problem } from './problems.ts'

const Text = Schema.String.check(
  Schema.isMinLength(1, { message: 'cannot be empty' }),
)

const Slug = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'use lowercase without accents, with hyphens between words',
  }),
)

/** The own calculations the build knows how to redo. */
export const OPERATIONS = [
  'difference',
  'sum',
  'ratio',
  'mean',
  'complement',
] as const
export type Operation = (typeof OPERATIONS)[number]

/** A number taken from a Fact sheet, the input of an own calculation. */
const Input = Schema.Struct({ value: Schema.Finite, fact_sheet: Slug })

/** "Conta nossa": the operation and the Fact sheet numbers it runs on. */
export const Calculation = Schema.Struct({
  operation: Schema.Literals(OPERATIONS),
  inputs: Schema.Array(Input),
})
export type Calculation = typeof Calculation.Type

/** A number of a bar or a time line point: from a Fact sheet
 * (`fact_sheet`) or from an own calculation (`calculation`), one of the
 * two. */
const sourced = {
  value: Schema.Finite,
  fact_sheet: Schema.optional(Slug),
  calculation: Schema.optional(Calculation),
}

/** What a point of a chart may say about itself (#470): the country its
 * number is from, in Portuguese as the page writes it ("Brasil", "Estados
 * Unidos"), which the country filter (`?pais=`) and Brazil's highlight read;
 * the year, a number the Fact sheet has too; and which of the Visual's
 * definitions it measures. */
const point = {
  country: Schema.optional(Text),
  year: Schema.optional(Schema.Int),
  definition: Schema.optional(Slug),
}

/** The closed list of what the points of one Visual measure, when Studies
 * define the thing differently ("qualquer canal online", "só
 * aplicativos"). Each gets its own mark shape, in the list's order, and the
 * legend explains it. */
export const MAX_DEFINITIONS = 4
const Definitions = Schema.Array(
  Schema.Struct({ id: Slug, legend: Text }),
).check(
  Schema.isMaxLength(MAX_DEFINITIONS, {
    message: `at most ${MAX_DEFINITIONS} definitions, one per mark shape`,
  }),
)

export const BarsVisual = Schema.Struct({
  id: Slug,
  kind: Schema.Literal('bars'),
  title: Text,
  /** The unit every bar shares, on one axis: `%`, `pontos`. */
  unit: Text,
  /** The top of the axis; without it, the smallest round number above the
   * largest bar (100 for `%`). */
  max: Schema.optional(Schema.Finite),
  bars: Schema.Array(Schema.Struct({ label: Text, ...sourced, ...point })),
  definitions: Schema.optional(Definitions),
  /** The label of the bar the hand-drawn highlight marks. */
  highlight: Schema.optional(Text),
  note: Schema.optional(Text),
})

/** Bars split into parts that add up to 100% (#476), one bar per group:
 * how many gave each answer of a question, in the order of `segments`,
 * from the left. A bar is about one group of the Fact sheet's sample, so
 * its `applies_to` says who, as a finding's does, for the "você" mark. */
export const StackedBarsVisual = Schema.Struct({
  id: Slug,
  kind: Schema.Literal('stacked-bars'),
  title: Text,
  /** What each part is ("Contentes", "Neutros"), from the left. */
  segments: Schema.Array(Text),
  bars: Schema.Array(
    Schema.Struct({
      label: Text,
      /** One percentage per segment, as the Fact sheet has it. */
      values: Schema.Array(Schema.Finite),
      fact_sheet: Slug,
      applies_to: Schema.optional(Coverage),
      country: point.country,
      year: point.year,
    }),
  ),
  note: Schema.optional(Text),
})

export const TimelineVisual = Schema.Struct({
  id: Slug,
  kind: Schema.Literal('timeline'),
  title: Text,
  events: Schema.Array(
    Schema.Struct({
      year: Schema.Int,
      label: Text,
      unit: Text,
      ...sourced,
      country: point.country,
      definition: point.definition,
    }),
  ),
  definitions: Schema.optional(Definitions),
  /** The year the hand-drawn highlight marks. */
  highlight: Schema.optional(Schema.Int),
  note: Schema.optional(Text),
})

/** How a Study's number spreads across the places it pooled (#472): Kowal's
 * average of 50 countries, from Ghana's 7% to Poland's 33%, with Brazil
 * inside. The chart draws a line from the smallest point to the largest,
 * through the row's own value, in the row's unit. */
const RangePoint = Schema.Struct({
  label: Text,
  ...sourced,
  country: point.country,
})

export const StudyTableVisual = Schema.Struct({
  id: Slug,
  kind: Schema.Literal('study-table'),
  title: Text,
  rows: Schema.Array(
    Schema.Struct({
      fact_sheet: Slug,
      measure: Text,
      value: Schema.Finite,
      unit: Text,
      ...point,
      range: Schema.optional(Schema.Array(RangePoint)),
    }),
  ),
  definitions: Schema.optional(Definitions),
  note: Schema.optional(Text),
})

/** What backs an arrow, and so its stroke: a study tested the cause (solid),
 * found only an association (dashed), or the arrow is our inference
 * (marked). */
export const EVIDENCE = ['cause', 'association', 'inference'] as const
export type Evidence = (typeof EVIDENCE)[number]

export const DiagramVisual = Schema.Struct({
  id: Slug,
  kind: Schema.Literal('diagram'),
  title: Text,
  nodes: Schema.Array(Schema.Struct({ id: Slug, label: Text })),
  arrows: Schema.Array(
    Schema.Struct({
      from: Slug,
      to: Slug,
      evidence: Schema.Literals(EVIDENCE),
      /** The finding the arrow draws, one sentence. */
      text: Text,
      fact_sheets: Schema.Array(Slug),
    }),
  ),
  note: Schema.optional(Text),
})

export const KINDS = [
  'bars',
  'stacked-bars',
  'timeline',
  'study-table',
  'diagram',
] as const

export const Visual = Schema.Union([
  BarsVisual,
  StackedBarsVisual,
  TimelineVisual,
  StudyTableVisual,
  DiagramVisual,
]).annotate({
  // Effect picks the member by `kind`; with an unknown `kind` it would list
  // the structs.
  message: `\`kind\` is one of ${KINDS.join(' | ')}`,
})
export type Visual = typeof Visual.Type
export type BarsVisual = typeof BarsVisual.Type
export type StackedBarsVisual = typeof StackedBarsVisual.Type
export type TimelineVisual = typeof TimelineVisual.Type
export type StudyTableVisual = typeof StudyTableVisual.Type
export type DiagramVisual = typeof DiagramVisual.Type

/** The line that places a Visual in the body: alone on its line. */
export const VISUAL_PLACEHOLDER = /^\{\{visual:([a-z0-9]+(?:-[a-z0-9]+)*)\}\}$/
const ANY_PLACEHOLDER = /\{\{\s*visual\b[^}]*\}\}/g

export const placeholder = (id: string) => `{{visual:${id}}}`

/** Each declared Visual is placed once in the body, and each placeholder
 * names a declared Visual. */
export function visualPlacementProblems(
  file: string,
  visuals: ReadonlyArray<Visual>,
  body: string,
): Problem[] {
  const errors: Problem[] = []
  const seen = new Set<string>()
  visuals.forEach((visual, i) => {
    if (seen.has(visual.id))
      errors.push(
        problem(
          file,
          `the Visual "${visual.id}" is declared twice`,
          `visuals.${i}.id`,
        ),
      )
    seen.add(visual.id)
  })
  const placed: string[] = []
  for (const line of body.split('\n')) {
    const found = line.match(ANY_PLACEHOLDER) ?? []
    if (found.length === 0) continue
    const alone = VISUAL_PLACEHOLDER.exec(line.trim())
    if (!alone?.[1]) {
      errors.push(
        problem(
          file,
          `"${line.trim()}": a Visual goes alone on its line, written {{visual:<id>}}`,
        ),
      )
      continue
    }
    placed.push(alone[1])
  }
  for (const id of new Set(placed)) {
    const count = placed.filter((p) => p === id).length
    if (!seen.has(id))
      errors.push(
        problem(
          file,
          `the body places the Visual "${id}", which \`visuals\` does not declare`,
        ),
      )
    else if (count > 1)
      errors.push(
        problem(file, `the body places the Visual "${id}" ${count} times`),
      )
  }
  visuals.forEach((visual, i) => {
    if (!placed.includes(visual.id))
      errors.push(
        problem(
          file,
          `the Visual "${visual.id}" is declared and not placed; put ${placeholder(visual.id)} on a line of its own in the body`,
          `visuals.${i}`,
        ),
      )
  })
  return errors
}

/** The result of an own calculation, or `null` when the operation does not
 * take that many inputs (or divides by zero). */
export function compute(calculation: Calculation): number | null {
  const values = calculation.inputs.map((i) => i.value)
  const [a, b] = values
  switch (calculation.operation) {
    case 'difference':
      return values.length === 2 && a !== undefined && b !== undefined
        ? a - b
        : null
    case 'ratio':
      return values.length === 2 && a !== undefined && b ? a / b : null
    case 'sum':
      return values.length >= 2 ? values.reduce((x, y) => x + y, 0) : null
    case 'mean':
      return values.length >= 2
        ? values.reduce((x, y) => x + y, 0) / values.length
        : null
    case 'complement':
      // The rest of a percentage: 100 − a.
      return values.length === 1 && a !== undefined ? 100 - a : null
  }
}

const ARITY: Record<Operation, string> = {
  difference: 'exactly two inputs (the first minus the second)',
  ratio: 'exactly two inputs (the first divided by the second, not zero)',
  sum: 'two or more inputs',
  mean: 'two or more inputs',
  complement: 'exactly one input (100 minus it)',
}

/** How many decimals a number is written with: `0.1` has one, `24` none. */
export function decimals(value: number): number {
  return String(value).split('.')[1]?.length ?? 0
}

/** The numbers written in a text, each in every reading it allows.
 *
 * Normalization: a Fact sheet mixes Portuguese ("2.400", "0,1") and the
 * original's excerpt, often in English ("2,400", "0.1"). So a token with a
 * separator counts in both readings that make sense: `.` or `,` as the
 * decimal mark, or as the thousands mark when every group after the first
 * has three digits. "39%", "39" and "39,0" all give 39; "2.400" gives 2400
 * and 2.4. A minus sign right before the digits (not the dash of a range,
 * "18-24") makes the number negative; `inFactSheet` decides what matches.
 * Numbers written in words do not count: the Fact sheet must have the
 * digits. */
export function numbersInText(text: string): Set<number> {
  const found = new Set<number>()
  for (const [, minus, token = ''] of text.matchAll(
    /(?<![\p{L}\p{N}])([-−])?(\d+(?:[.,]\d+)*)/gu,
  )) {
    const sign = minus ? -1 : 1
    const add = (n: number) => found.add(sign * n)
    const groups = token.split(/[.,]/)
    if (groups.length === 1) {
      add(Number(token))
      continue
    }
    const groupsOfThree = (list: ReadonlyArray<string>) =>
      list.slice(1).every((g) => g.length === 3)
    // Every separator groups thousands, and they are all the same mark.
    if (groupsOfThree(groups) && new Set(token.replace(/\d/g, '')).size === 1)
      add(Number(groups.join('')))
    // The last separator is the decimal mark, appears once, and the others
    // before it group thousands.
    const at = Math.max(token.lastIndexOf('.'), token.lastIndexOf(','))
    const mark = token[at] ?? ''
    const whole = token.slice(0, at)
    const wholeGroups = whole.split(/[.,]/)
    if (!whole.includes(mark) && groupsOfThree(wholeGroups))
      add(Number(`${wholeGroups.join('')}.${token.slice(at + 1)}`))
  }
  return found
}

/** The text of a Fact sheet a number is looked up in: what it measured, the
 * Achados table (measure, value and excerpt, but not the locator, whose page
 * numbers would match anything), the notes, the extra sections, the
 * limitations, the sample and the period. Not the reference (volume, pages)
 * nor "Como usamos", which the site does not show. */
export function factSheetText(factSheet: FactSheet): string {
  return [
    factSheet.whatItMeasured,
    ...factSheet.findings.flatMap((f) => [f.measure, f.value, f.excerpt ?? '']),
    factSheet.findingsNotes,
    ...factSheet.otherSections.map((s) => s.markdown),
    factSheet.limitations,
    factSheet.sample.description,
    factSheet.sample.n === undefined ? '' : String(factSheet.sample.n),
    factSheet.period,
  ].join('\n')
}

const sameNumber = (a: number, b: number) => Math.abs(a - b) < 1e-9

/** A Visual's number matches one of the Fact sheet's: the same, or, for a
 * negative one, the same without the sign, since a Fact sheet may say
 * "0,3 ponto a menos". A positive number never matches "−0,3". */
const inFactSheet = (found: ReadonlySet<number>, value: number) =>
  [...found].some(
    (n) => sameNumber(n, value) || (value < 0 && sameNumber(n, -value)),
  )

/** The result rounded to `places` decimals, without `toFixed`'s binary
 * slips (1.005 → 1.01). */
const roundTo = (value: number, places: number) => {
  const factor = 10 ** places
  return Math.round(value * factor * (1 + Number.EPSILON)) / factor
}

/** A Guide with Visuals, as the build has it after linking: its file and
 * the Fact sheets its text cites (the page's numbering). */
export interface GuideWithVisuals {
  readonly file: string
  readonly visuals?: ReadonlyArray<Visual>
  readonly citedFactSheets: ReadonlyArray<string>
}

/** The Visuals' checks against the Fact sheets. */
export function visualProblems(
  guides: ReadonlyArray<GuideWithVisuals>,
  factSheets: ReadonlyArray<FactSheet>,
): Problem[] {
  const bySlug = new Map(factSheets.map((f) => [f.slug, f]))
  const texts = new Map<string, Set<number>>()
  const numbersOf = (factSheet: FactSheet) => {
    const cached = texts.get(factSheet.slug)
    if (cached) return cached
    const found = numbersInText(factSheetText(factSheet))
    texts.set(factSheet.slug, found)
    return found
  }
  const errors: Problem[] = []
  for (const guide of guides) {
    const err = (text: string, field: string) =>
      errors.push(problem(guide.file, text, field))

    /** The Fact sheet exists, is ✅/🟡 and the page cites it. */
    const usable = (slug: string, field: string): FactSheet | null => {
      const factSheet = bySlug.get(slug)
      if (!factSheet) {
        err(`the fact sheet "${slug}" does not exist in studies/`, field)
        return null
      }
      if (factSheet.status === 'unverified') {
        err(
          `the fact sheet "${slug}" was not verified (⬜); a Visual only takes numbers from ✅ or 🟡 fact sheets`,
          field,
        )
        return null
      }
      if (!guide.citedFactSheets.includes(slug))
        err(
          `the Guide does not cite the fact sheet "${slug}"; the text the Visual illustrates cites it with [@${slug}], so it has a number in the page's list`,
          field,
        )
      return factSheet
    }

    /** The number is in the Fact sheet's text. */
    const fromFactSheet = (value: number, slug: string, field: string) => {
      const factSheet = usable(slug, field)
      if (factSheet && !inFactSheet(numbersOf(factSheet), value))
        err(
          `the number ${value} is not in the fact sheet "${slug}"; write it in the Visual as the fact sheet has it`,
          field,
        )
    }

    const sourcedNumber = (
      datum: {
        value: number
        fact_sheet?: string | undefined
        calculation?: Calculation | undefined
      },
      unit: string,
      field: string,
    ) => {
      if (datum.fact_sheet && datum.calculation)
        return err(
          'a number comes from a fact sheet or from an own calculation, not both',
          field,
        )
      if (datum.fact_sheet)
        return fromFactSheet(
          datum.value,
          datum.fact_sheet,
          `${field}.fact_sheet`,
        )
      if (!datum.calculation)
        return err(
          'missing where the number comes from: `fact_sheet`, or `calculation` for an own calculation',
          field,
        )
      const { calculation } = datum
      calculation.inputs.forEach((input, k) =>
        fromFactSheet(
          input.value,
          input.fact_sheet,
          `${field}.calculation.inputs.${k}`,
        ),
      )
      const result = compute(calculation)
      if (result === null)
        return err(
          `"${calculation.operation}" takes ${ARITY[calculation.operation]}`,
          `${field}.calculation`,
        )
      if (calculation.operation === 'complement' && unit !== '%')
        return err(
          `"complement" is 100 minus a percentage, and the unit here is "${unit}"`,
          `${field}.calculation`,
        )
      const places = decimals(datum.value)
      const rounded = roundTo(result, places)
      if (!sameNumber(rounded, datum.value))
        err(
          `the own calculation gives ${rounded}, not ${datum.value} (${calculation.operation} of ${calculation.inputs.map((i) => i.value).join(', ')}, rounded to ${places} decimal(s))`,
          `${field}.value`,
        )
    }

    /** Each point names one of the Visual's definitions when it has them,
     * and a year comes from the point's Fact sheet. */
    const pointChecks = (
      definitions: ReadonlyArray<{ id: string }> | undefined,
      points: ReadonlyArray<{
        definition?: string | undefined
        year?: number | undefined
        fact_sheet?: string | undefined
      }>,
      field: string,
      withYear: boolean,
    ) => {
      const ids = definitions?.map((d) => d.id) ?? []
      if (new Set(ids).size !== ids.length)
        err('two definitions have the same id', `${field}.definitions`)
      points.forEach((p, j) => {
        const at = `${field}.${j}`
        if (p.definition !== undefined && !ids.includes(p.definition))
          err(
            ids.length === 0
              ? `"${p.definition}" names a definition, and the Visual has no \`definitions\``
              : `"${p.definition}" is not one of the Visual's definitions (${ids.join(', ')})`,
            `${at}.definition`,
          )
        else if (p.definition === undefined && ids.length > 0)
          err('the Visual has definitions, so each point names one', at)
        if (withYear && p.year !== undefined && p.fact_sheet)
          fromFactSheet(p.year, p.fact_sheet, `${at}.year`)
      })
    }

    guide.visuals?.forEach((visual, i) => {
      const at = `visuals.${i}`
      if (visual.kind === 'bars')
        pointChecks(visual.definitions, visual.bars, `${at}.bars`, true)
      if (visual.kind === 'timeline')
        pointChecks(visual.definitions, visual.events, `${at}.events`, false)
      if (visual.kind === 'study-table')
        pointChecks(visual.definitions, visual.rows, `${at}.rows`, true)
      switch (visual.kind) {
        case 'bars': {
          if (visual.bars.length < 2)
            err('a bar comparison has two or more bars', `${at}.bars`)
          visual.bars.forEach((bar, j) =>
            sourcedNumber(bar, visual.unit, `${at}.bars.${j}`),
          )
          const largest = Math.max(...visual.bars.map((b) => b.value))
          if (visual.max !== undefined && visual.max < largest)
            err(
              `the axis top (${visual.max}) is below the largest bar (${largest})`,
              `${at}.max`,
            )
          if (visual.bars.some((b) => b.value < 0))
            err('a bar starts at zero and does not go below it', `${at}.bars`)
          if (
            visual.highlight !== undefined &&
            !visual.bars.some((b) => b.label === visual.highlight)
          )
            err(`no bar is labelled "${visual.highlight}"`, `${at}.highlight`)
          break
        }
        case 'stacked-bars': {
          const parts = visual.segments.length
          if (parts < 2)
            err('a stacked bar has two or more parts', `${at}.segments`)
          if (visual.bars.length === 0)
            err('a stacked bar comparison has at least one bar', `${at}.bars`)
          visual.bars.forEach((bar, j) => {
            const field = `${at}.bars.${j}`
            if (bar.values.length !== parts)
              return err(
                `the bar has ${bar.values.length} parts, and \`segments\` names ${parts}`,
                `${field}.values`,
              )
            bar.values.forEach((value, k) =>
              fromFactSheet(value, bar.fact_sheet, `${field}.values.${k}`),
            )
            if (bar.year !== undefined)
              fromFactSheet(bar.year, bar.fact_sheet, `${field}.year`)
            if (bar.values.some((v) => v < 0))
              err('a part does not go below zero', `${field}.values`)
            // Each part is rounded, so the sum may miss 100 by half a point
            // per part.
            const sum = roundTo(
              bar.values.reduce((a, b) => a + b, 0),
              2,
            )
            if (Math.abs(sum - 100) > parts / 2)
              err(
                `the parts add up to ${sum}%; a stacked bar adds up to 100%, give or take the rounding`,
                `${field}.values`,
              )
          })
          break
        }
        case 'timeline': {
          if (visual.events.length < 2)
            err('a time line has two or more points', `${at}.events`)
          visual.events.forEach((event, j) => {
            sourcedNumber(event, event.unit, `${at}.events.${j}`)
            // The year is a number on the Visual too: the Fact sheet's
            // period or text has it.
            if (event.fact_sheet)
              fromFactSheet(
                event.year,
                event.fact_sheet,
                `${at}.events.${j}.year`,
              )
          })
          const years = visual.events.map((e) => e.year)
          if (years.some((y, j) => j > 0 && y < (years[j - 1] ?? y)))
            err('the time line goes in year order', `${at}.events`)
          if (
            visual.highlight !== undefined &&
            !years.includes(visual.highlight)
          )
            err(`no point is in ${visual.highlight}`, `${at}.highlight`)
          break
        }
        case 'study-table': {
          if (visual.rows.length < 2)
            err('a table of Studies has two or more rows', `${at}.rows`)
          visual.rows.forEach((row, j) => {
            fromFactSheet(row.value, row.fact_sheet, `${at}.rows.${j}.value`)
            if (!row.range) return
            const field = `${at}.rows.${j}.range`
            if (row.range.length < 2)
              return err('a range has two or more points', field)
            row.range.forEach((p, k) =>
              sourcedNumber(p, row.unit, `${field}.${k}`),
            )
            const values = row.range.map((p) => p.value)
            const [low, high] = [Math.min(...values), Math.max(...values)]
            if (row.value < low || row.value > high)
              err(
                `the value ${row.value} is outside its range, from ${low} to ${high}`,
                `${at}.rows.${j}.value`,
              )
          })
          break
        }
        case 'diagram': {
          const nodes = new Set(visual.nodes.map((n) => n.id))
          if (nodes.size !== visual.nodes.length)
            err('two nodes have the same id', `${at}.nodes`)
          if (visual.arrows.length === 0)
            err('a relation diagram has at least one arrow', `${at}.arrows`)
          visual.arrows.forEach((arrow, j) => {
            const field = `${at}.arrows.${j}`
            for (const end of [arrow.from, arrow.to] as const)
              if (!nodes.has(end))
                err(`the node "${end}" does not exist in \`nodes\``, field)
            if (arrow.from === arrow.to)
              err('an arrow links two different nodes', field)
            if (arrow.fact_sheets.length === 0)
              err(
                'an arrow is a finding and cites at least one fact sheet, our inference too',
                `${field}.fact_sheets`,
              )
            const cited = arrow.fact_sheets.flatMap((slug) => {
              const f = usable(slug, `${field}.fact_sheets`)
              return f ? [f] : []
            })
            // A solid arrow says a study tested the cause: an experiment, or
            // a meta-analysis (which pools the experiments).
            if (
              arrow.evidence === 'cause' &&
              cited.length > 0 &&
              !cited.some(
                (f) =>
                  f.design === 'experiment' || f.design === 'meta-analysis',
              )
            )
              err(
                'a solid arrow (a study tested the cause) cites an experiment or a meta-analysis; otherwise it is an association',
                `${field}.evidence`,
              )
          })
          break
        }
      }
    })
  }
  // The year and the value of one point can both find the same Fact sheet
  // unverified or uncited: one line each is enough.
  return [...new Map(errors.map((e) => [e.message, e])).values()]
}
