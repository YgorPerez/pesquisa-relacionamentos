// The Neighbor sites and their Readings (#179; GLOSSARY: Site vizinho,
// Leitura): outside pages the site points readers to, never a Source. One
// file, `data/neighbor-sites.yaml`. A site carries the notices every one of
// its Readings inherits (what it sells, the cause it declares); a Reading
// may add its own, and only a Reading a Caveat. The build fails on a repeated URL, a missing field, a
// Topic that does not exist or a Reading of an unknown site.
import { Schema } from 'effect'
import { parse as parseYaml } from 'yaml'
import { Slug, Url } from './schema.ts'
import { decode, problem, type Problem } from './problems.ts'
import { READING_LANGUAGES, type NoticeKind } from './lists.ts'

export const NEIGHBOR_SITES_FILE = 'data/neighbor-sites.yaml'

const Text = Schema.String.check(
  Schema.isMinLength(1, { message: 'cannot be empty' }),
)

/** A site's notices, each one sentence in PT-BR for the reader. */
const SiteNotices = Schema.Struct({
  /** What the site or the author sells (a course, therapy, a book). */
  commercial: Schema.optional(Text),
  /** The cause the site declares, or where the page first came out. */
  cause: Schema.optional(Text),
})

/** A Reading's notices: the site's kinds and the Caveat (`NOTICE_KINDS`). */
const ReadingNotices = Schema.Struct({
  ...SiteNotices.fields,
  /** What a study the page cites found, where the page overstates or
   * distorts it on a side point (GLOSSARY: Ressalva). */
  caveat: Schema.optional(Text),
} satisfies Record<NoticeKind, unknown>)
export type Notices = typeof ReadingNotices.Type

const NeighborSite = Schema.Struct({
  id: Slug,
  name: Text,
  /** The site's home. Kept for whoever curates; the page never links it. */
  home: Url,
  language: Schema.Literals(READING_LANGUAGES),
  notices: Schema.optional(SiteNotices),
})
export type NeighborSite = typeof NeighborSite.Type

const Reading = Schema.Struct({
  site: Slug,
  title: Text,
  url: Url,
  /** One line for the reader, in PT-BR, true to the page. */
  description: Text,
  topics: Schema.Array(Slug).check(
    Schema.isMinLength(1, { message: 'name at least one Topic' }),
  ),
  notices: Schema.optional(ReadingNotices),
})
export type Reading = typeof Reading.Type

const NeighborSitesFile = Schema.Struct({
  sites: Schema.Array(NeighborSite),
  readings: Schema.Array(Reading),
})

export interface NeighborSites {
  readonly sites: ReadonlyArray<NeighborSite>
  readonly readings: ReadonlyArray<Reading>
}

export type ParsedNeighborSites =
  | { readonly ok: true; readonly neighborSites: NeighborSites }
  | { readonly ok: false; readonly errors: ReadonlyArray<Problem> }

/** The same page with http or https, with or without `www.`, the trailing
 * slash or the fragment. The query stays: it can name another page. */
const samePage = (url: string) =>
  url
    .replace(/#.*$/, '')
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/+(?=\?|$)/, '')

export function readNeighborSites(
  file: string,
  text: string,
  topics: ReadonlySet<string>,
): ParsedNeighborSites {
  let value: unknown
  try {
    value = parseYaml(text) ?? {}
  } catch (e) {
    return {
      ok: false,
      errors: [problem(file, `is not valid YAML: ${(e as Error).message}`)],
    }
  }
  const decoded = decode(NeighborSitesFile, value, file)
  if (!decoded.ok) return { ok: false, errors: decoded.problems }
  const { sites, readings } = decoded.value

  const errors: Problem[] = []
  const ids = new Set<string>()
  sites.forEach((site, i) => {
    if (ids.has(site.id))
      errors.push(
        problem(file, `the site ${site.id} is listed twice`, `sites.${i}.id`),
      )
    ids.add(site.id)
  })
  const urls = new Map<string, number>()
  readings.forEach((reading, i) => {
    if (!ids.has(reading.site))
      errors.push(
        problem(
          file,
          `the site ${reading.site} is not in sites`,
          `readings.${i}.site`,
        ),
      )
    reading.topics.forEach((topic, t) => {
      if (!topics.has(topic))
        errors.push(
          problem(
            file,
            `the Topic ${topic} does not exist (guides/${topic}.md)`,
            `readings.${i}.topics.${t}`,
          ),
        )
    })
    const page = samePage(reading.url)
    const first = urls.get(page)
    if (first !== undefined)
      errors.push(
        problem(
          file,
          `the URL ${reading.url} is already Reading ${first}`,
          `readings.${i}.url`,
        ),
      )
    else urls.set(page, i)
  })
  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, neighborSites: { sites, readings } }
}
