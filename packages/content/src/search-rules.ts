// The build rules about search and links (#15): warnings for long titles and
// descriptions, `previous` entries that cannot hold, and the last published
// sitemap.
import type { Library } from './library.ts'
import {
  tipSearch,
  factSheetSearch,
  topicSearch,
  oldPaths,
  sitePaths,
  LIMITS,
  type SearchMeta,
} from './search.ts'
import { isFactSheetIndexable } from './paths.ts'
import type { Seo } from './schema.ts'
import { problem, type Problem } from './problems.ts'

function itemWarnings(
  file: string,
  search: SearchMeta,
  seo: Seo | undefined,
  titleField: string,
): Problem[] {
  const warnings: Problem[] = []
  if (search.title.length > LIMITS.title)
    warnings.push(
      problem(
        file,
        `the search title has ${search.title.length} characters and the limit is ${LIMITS.title}; write a shorter one in seo.title`,
        seo?.title ? 'seo.title' : titleField,
      ),
    )
  if (search.description.length > LIMITS.description)
    warnings.push(
      problem(
        file,
        `the search description has ${search.description.length} characters and the limit is ${LIMITS.description}`,
        'seo.description',
      ),
    )
  return warnings
}

/** A title or description Google would cut, only on indexed pages. The
 * derived description already comes out cut; only the `seo` one can go over
 * the limit. */
export function searchWarnings(library: Library): Problem[] {
  return [
    ...library.topics.flatMap((t) =>
      itemWarnings(t.file, topicSearch(t), t.seo, 'title'),
    ),
    ...library.tips
      .filter((d) => d.published)
      .flatMap((d) => itemWarnings(d.file, tipSearch(d), d.seo, 'text')),
    ...library.factSheets
      .filter(isFactSheetIndexable)
      .flatMap((f) => itemWarnings(f.file, factSheetSearch(f), f.seo, 'title')),
  ]
}

/** `previous` only lists paths that disappeared, and each has a single owner:
 * one file and one destination (two Questions of one Guide share a file). */
export function beforeErrors(library: Library): Problem[] {
  const errors: Problem[] = []
  const site = sitePaths(library)
  const owner = new Map<string, { file: string; current: string }>()
  for (const { old, file, current } of oldPaths(library)) {
    if (site.has(old)) {
      errors.push(
        problem(
          file,
          `the path ${old} is still a page of the site; "previous" only lists paths that disappeared`,
          'previous',
        ),
      )
      continue
    }
    const other = owner.get(old)
    if (other === undefined) owner.set(old, { file, current })
    else if (other.file !== file || other.current !== current)
      errors.push(
        problem(
          file,
          `the path ${old} already leads to ${other.current}, from ${other.file}`,
          'previous',
        ),
      )
  }
  return errors
}

const PUBLISHED_SITEMAP = 'published sitemap.xml'

const withoutTrailingSlash = (path: string) =>
  path.length > 1 ? path.replace(/\/+$/, '') : path

/** Every path of the last published sitemap is still a page or is in some
 * file's `previous`: no link breaks by accident. */
export function checkPreviousSitemap(library: Library, xml: string): Problem[] {
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(
    (m) => m[1] ?? '',
  )
  if (locs.length === 0)
    return [
      problem(PUBLISHED_SITEMAP, 'found no <loc>; check the downloaded file'),
    ]
  const site = sitePaths(library)
  const old = new Set(oldPaths(library).map((c) => c.old))
  return locs
    .map((loc) => {
      try {
        return withoutTrailingSlash(decodeURI(new URL(loc).pathname))
      } catch {
        return loc
      }
    })
    .filter((path) => !site.has(path) && !old.has(path))
    .map((path) =>
      problem(
        PUBLISHED_SITEMAP,
        `${path} disappeared from the site; declare the old path in the "previous" of the file that replaced it`,
      ),
    )
}
