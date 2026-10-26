// What goes to search engines and what keeps links alive (#15): each page's
// title and description, sitemap, robots and the 301s from `previous`. Only
// outside types and the lists: the app server imports from here without
// pulling `node:fs` or Effect. The rules that become build errors or warnings
// live in `search-rules.ts`.
import type { Library } from './library.ts'
import {
  calculatorPath,
  tipPath,
  factSheetPath,
  questionPath,
  topicPath,
  isFactSheetIndexable,
} from './paths.ts'
import type { FactSheet } from './fact-sheet.ts'
import type { Tip, Topic } from './items.ts'
import { CALCULATORS, RESERVED_ROUTES } from './lists.ts'

/** The site's address, for the sitemap, the canonical and Open Graph. */
export const ORIGIN = 'https://temestudo.cloud'

/** How much of the title and description Google shows without cutting. */
export const LIMITS = { title: 60, description: 155 } as const

export interface SearchMeta {
  readonly title: string
  readonly description: string
}

/** Content markdown as plain text: no `[@slug]` references, no `==mark==`, no
 * links or emphasis. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\s*\[@[a-z0-9-]+\]/g, '')
    .replace(/==([^=\n]+)==/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Cuts at a word, with an ellipsis, to fit the limit. */
export function truncate(
  text: string,
  limit: number = LIMITS.description,
): string {
  return text.length <= limit
    ? text
    : `${text.slice(0, limit - 1).replace(/\s+\S*$/, '')}…`
}

const withSeo = (
  seo: { title?: string; description?: string } | undefined,
  derived: SearchMeta,
): SearchMeta => ({
  title: seo?.title ?? derived.title,
  description: seo?.description ?? derived.description,
})

/** Topic, whose page is its Guide: the title and the opening paragraph. */
export const topicSearch = (
  topic: Pick<Topic, 'title' | 'opening' | 'seo'>,
): SearchMeta =>
  withSeo(topic.seo, {
    title: plainText(topic.title),
    description: truncate(plainText(topic.opening)),
  })

/** Fact sheet: "Author year: topic" and the first finding. */
export function factSheetSearch(
  factSheet: Pick<FactSheet, 'title' | 'findings' | 'reference' | 'seo'>,
): SearchMeta {
  const first = factSheet.findings[0]
  return withSeo(factSheet.seo, {
    title: plainText(factSheet.title.replace(/\s*\((\d{4}[a-z]?)\)/, ' $1')),
    description: truncate(
      plainText(
        first ? `${first.measure}: ${first.value}.` : factSheet.reference,
      ),
    ),
  })
}

/** Tip: the text, in the title and the description. */
export function tipSearch(tip: Pick<Tip, 'text' | 'seo'>): SearchMeta {
  const text = plainText(tip.text)
  return withSeo(tip.seo, { title: text, description: truncate(text) })
}

/** The paths that go to the sitemap: home, the topics (each one's page is
 * its Guide), the published tips, the ✅/🟡 fact sheets and the calculators.
 * A ⬜ fact sheet stays out, and so does a Question, which is a section of
 * its topic's page (ADR 0042). */
export function sitemapPaths(library: Library): string[] {
  return [
    '/',
    ...library.topics.map(topicPath),
    '/dicas',
    ...library.tips.filter((d) => d.published).map(tipPath),
    '/estudos',
    ...library.factSheets.filter(isFactSheetIndexable).map(factSheetPath),
    ...CALCULATORS.map(calculatorPath),
  ]
}

/** Every path that answers with a page, indexed or not: the sitemap, the ⬜
 * fact sheets and the app's fixed routes. */
export function sitePaths(library: Library): Set<string> {
  return new Set([
    ...sitemapPaths(library),
    ...library.factSheets.map(factSheetPath),
    ...RESERVED_ROUTES.map((r) => `/${r}`),
  ])
}

export function sitemapXml(library: Library): string {
  const urls = sitemapPaths(library).map(
    (c) => `  <url><loc>${ORIGIN}${c}</loc></url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

/** Everything allowed: what stays out of search carries `noindex` on the
 * page, which the crawler only reads if it can open the page. */
export const robotsTxt = (): string =>
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`

/** An old path declared in a file's `previous`. */
export interface OldPath {
  readonly old: string
  readonly current: string
  readonly file: string
}

/** Each file's old paths, in library order. The `previous` of a fact sheet, a tip
 * and a topic lists slugs; a guide's lists slugs in the same topic or
 * `topic/slug` when the guide changed topic. A renamed topic takes its guides
 * along, with each one's old slugs. A Question's own page, `/<topic>/<slug>`,
 * is itself an old path since ADR 0042: it leads to the Question's section,
 * `/<topic>#<slug>`. */
export function oldPaths(library: Library): OldPath[] {
  const list: OldPath[] = []
  for (const factSheet of library.factSheets)
    for (const slug of factSheet.previous ?? [])
      list.push({
        old: `/estudos/${slug}`,
        current: factSheetPath(factSheet),
        file: factSheet.file,
      })
  for (const tip of library.tips)
    for (const slug of tip.previous ?? [])
      list.push({
        old: `/dicas/${slug}`,
        current: tipPath(tip),
        file: tip.file,
      })
  for (const topic of library.topics)
    for (const slug of topic.previous ?? [])
      list.push({
        old: `/${slug}`,
        current: topicPath(topic),
        file: topic.file,
      })
  for (const guide of library.guides) {
    const current = questionPath(guide)
    const before = guide.previous ?? []
    const topics = [
      guide.topic,
      ...(library.topics.find((t) => t.slug === guide.topic)?.previous ?? []),
    ]
    const slugs = [guide.slug, ...before.filter((a) => !a.includes('/'))]
    for (const slug of slugs)
      for (const topic of topics) {
        const old = `/${topic}/${slug}`
        if (old !== current) list.push({ old, current, file: guide.file })
      }
    for (const path of before.filter((a) => a.includes('/')))
      list.push({ old: `/${path}`, current, file: guide.file })
  }
  return list
}

/** Old path → today's path, for the 301. Today's path may end in a
 * `#fragment`, the Question's section. */
export function redirects(library: Library): Record<string, string> {
  const map: Record<string, string> = {}
  for (const { old, current } of oldPaths(library)) map[old] ??= current
  return map
}
