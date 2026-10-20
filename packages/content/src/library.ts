// The whole library: reads the repository folders and returns the typed model
// or the build's list of errors. Reading the disk lives in `readFiles`; the
// rest (`buildLibrary`) is a pure function over texts, and it is the one that
// applies the rules across files (repeated DOI, references, confidence, the
// topics' `ordem`, the fact sheet cited by the data, `antes` and the last
// published sitemap).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { DataMeta } from './schema.ts'
import { readFactSheet, type FactSheet } from './fact-sheet.ts'
import {
  readTip,
  readGuide,
  readTopic,
  type Tip,
  type ParsedTip,
  type Guide,
  type ParsedGuide,
  type ParsedItem,
  type Topic,
} from './items.ts'
import { link } from './publication.ts'
import {
  PRIORITIES_FILE,
  PRIORITIES_META,
  readPriorities,
  type Priorities,
} from './priorities.ts'
import { decode, problem, type Problem } from './problems.ts'
import {
  searchWarnings,
  checkPreviousSitemap,
  beforeErrors,
} from './search-rules.ts'

/** A content file, with its path relative to the root (`estudos/x.md`). */
export interface ContentFile {
  readonly path: string
  readonly text: string
}

/** Where a data file comes from, read from its `.meta.yaml`. */
export interface DataOrigin extends DataMeta {
  /** Path of the `.meta.yaml` from the repository root. */
  readonly file: string
}

export interface Library {
  /** The fact sheets in slug order. */
  readonly factSheets: ReadonlyArray<FactSheet>
  /** The topics in slug order. */
  readonly topics: ReadonlyArray<Topic>
  /** The guides topic by topic, in each one's `ordem`. */
  readonly guides: ReadonlyArray<Guide>
  /** Every tip in slug order, published or not (`published`). */
  readonly tips: ReadonlyArray<Tip>
  /** The `.meta.yaml` files of `dados/`, in path order. */
  readonly data: ReadonlyArray<DataOrigin>
  /** The priorities file, or `null` while it does not exist. */
  readonly priorities: Priorities | null
}

export type LoadResult =
  | {
      readonly ok: true
      readonly library: Library
      readonly warnings: ReadonlyArray<Problem>
    }
  | {
      readonly ok: false
      readonly errors: ReadonlyArray<Problem>
      readonly warnings: ReadonlyArray<Problem>
    }

/** The folders the package reads (the content contract, still in Portuguese).
 * A file starting with `_` is a template or folder metadata and does not
 * become an item; the `_tema.md` of each guide folder is the topic. */
const FACT_SHEETS_FOLDER = 'estudos'
const TIPS_FOLDER = 'dicas'
const GUIDES_FOLDER = 'guias'
const TOPIC_FILE = '_tema.md'
/** The calculators' data. Only the `.meta.yaml` files come in: the CSVs are
 * large and the calculator is the one that reads them. */
const DATA_FOLDER = 'dados'
const META_SUFFIX = '.meta.yaml'

const isItem = (name: string) => name.endsWith('.md') && !name.startsWith('_')

function readFolder(
  root: string,
  folder: string,
  accepts: (name: string) => boolean,
): ContentFile[] {
  const dir = join(root, folder)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => accepts(name) && statSync(join(dir, name)).isFile())
    .sort()
    .map((name) => ({
      path: `${folder}/${name}`,
      text: readFileSync(join(dir, name), 'utf8'),
    }))
}

/** Reads from disk the content files of a repository root. */
export function readFiles(root: string): ReadonlyArray<ContentFile> {
  const guides = join(root, GUIDES_FOLDER)
  const topics = existsSync(guides)
    ? readdirSync(guides)
        .filter((name) => statSync(join(guides, name)).isDirectory())
        .sort()
    : []
  return [
    ...readFolder(root, FACT_SHEETS_FOLDER, isItem),
    ...readFolder(root, TIPS_FOLDER, isItem),
    ...topics.flatMap((topic) =>
      readFolder(
        root,
        `${GUIDES_FOLDER}/${topic}`,
        (name) => isItem(name) || name === TOPIC_FILE,
      ),
    ),
    ...readMetas(root),
    ...readIfExists(root, PRIORITIES_FILE),
  ]
}

function readIfExists(root: string, path: string): ContentFile[] {
  const fullPath = join(root, path)
  return existsSync(fullPath)
    ? [{ path, text: readFileSync(fullPath, 'utf8') }]
    : []
}

function readMetas(root: string): ContentFile[] {
  const data = join(root, DATA_FOLDER)
  if (!existsSync(data)) return []
  return (
    readdirSync(data, { recursive: true, encoding: 'utf8' })
      .map((c) => c.split('\\').join('/'))
      // A file or folder starting with `_` is a draft and stays out of the
      // build, like `dicas/_sem-ficha.md`.
      .filter(
        (c) =>
          c.endsWith(META_SUFFIX) &&
          !c.split('/').some((part) => part.startsWith('_')),
      )
      .sort()
      .map((c) => ({
        path: `${DATA_FOLDER}/${c}`,
        text: readFileSync(join(data, c), 'utf8'),
      }))
  )
}

export interface LoadOptions {
  /** The `sitemap.xml` that is live. With it, the build fails if a published
   * path disappeared without being in some file's `antes`. */
  readonly previousSitemap?: string
}

/** Builds the library from the texts, without touching the disk. */
export function buildLibrary(
  files: ReadonlyArray<ContentFile>,
  options: LoadOptions = {},
): LoadResult {
  const errors: Problem[] = []
  const warnings: Problem[] = []
  const factSheets: FactSheet[] = []
  const topics: Topic[] = []
  const metas: ContentFile[] = []
  const guides: ParsedGuide[] = []
  const tips: ParsedTip[] = []
  let prioritiesFile: ContentFile | null = null

  const broken = new Set<string>()
  const keep = <T>(path: string, parsed: ParsedItem<T>, target: T[]) => {
    if (parsed.ok) target.push(parsed.item)
    else {
      errors.push(...parsed.errors)
      broken.add(path)
    }
  }

  for (const { path, text } of files) {
    const parts = path.split('/')
    const name = parts[parts.length - 1] ?? ''
    if (path === PRIORITIES_FILE) {
      prioritiesFile = { path, text }
    } else if (parts[0] === DATA_FOLDER && name.endsWith(META_SUFFIX)) {
      metas.push({ path, text })
    } else if (
      parts[0] === FACT_SHEETS_FOLDER &&
      parts.length === 2 &&
      isItem(name)
    ) {
      const parsed = readFactSheet(path, text)
      keep(
        path,
        parsed.ok ? { ok: true, item: parsed.factSheet } : parsed,
        factSheets,
      )
    } else if (parts[0] === TIPS_FOLDER && parts.length === 2 && isItem(name)) {
      keep(path, readTip(path, text), tips)
    } else if (parts[0] === GUIDES_FOLDER && parts.length === 3) {
      if (name === TOPIC_FILE) keep(path, readTopic(path, text), topics)
      else if (isItem(name)) keep(path, readGuide(path, text), guides)
    }
  }

  factSheets.sort((a, b) => a.slug.localeCompare(b.slug))
  topics.sort((a, b) => a.slug.localeCompare(b.slug))
  tips.sort((a, b) => a.slug.localeCompare(b.slug))
  errors.push(...duplicateDois(factSheets))

  const linked = link({ factSheets, topics, guides, tips, broken })
  errors.push(...linked.errors)

  const data: DataOrigin[] = []
  for (const meta of [...metas].sort((a, b) => a.path.localeCompare(b.path))) {
    const parsed = readMeta(meta, factSheets)
    if (parsed.ok) data.push(parsed.origin)
    else errors.push(...parsed.errors)
  }

  let priorities: Priorities | null = null
  if (prioritiesFile) {
    const parsed = readPriorities(
      prioritiesFile.path,
      prioritiesFile.text,
      factSheets,
      metas.some((m) => m.path === PRIORITIES_META),
    )
    if (parsed.ok) priorities = parsed.priorities
    else errors.push(...parsed.errors)
  }

  if (errors.length > 0) return { ok: false, errors, warnings }
  const library: Library = {
    factSheets,
    topics: linked.topics,
    guides: linked.guides,
    tips: linked.tips,
    data,
    priorities,
  }
  warnings.push(...searchWarnings(library))
  errors.push(...beforeErrors(library))
  if (options.previousSitemap !== undefined)
    errors.push(...checkPreviousSitemap(library, options.previousSitemap))
  return errors.length > 0
    ? { ok: false, errors, warnings }
    : { ok: true, library, warnings }
}

/** Reads and builds: what the build and the app call. */
export function loadLibrary(
  root: string,
  options: LoadOptions = {},
): LoadResult {
  return buildLibrary(readFiles(root), options)
}

type ParsedMeta =
  | { readonly ok: true; readonly origin: DataOrigin }
  | { readonly ok: false; readonly errors: ReadonlyArray<Problem> }

/** A number only publishes with a ✅ or 🟡 fact sheet, like a claim (#10). */
function readMeta(
  { path, text }: ContentFile,
  factSheets: ReadonlyArray<FactSheet>,
): ParsedMeta {
  let value: unknown
  try {
    value = parseYaml(text) ?? {}
  } catch (e) {
    return {
      ok: false,
      errors: [problem(path, `is not valid YAML: ${(e as Error).message}`)],
    }
  }
  const decoded = decode(DataMeta, value, path)
  if (!decoded.ok) return { ok: false, errors: decoded.problems }
  const meta = decoded.value
  const errors: Problem[] = []
  if (!meta.tabela?.length && !meta.variaveis?.length)
    errors.push(
      problem(path, 'say the table or the variables the data came from'),
    )
  const factSheet = factSheetBySlug({ factSheets }, meta.ficha)
  if (!factSheet)
    errors.push(
      problem(
        path,
        `the fact sheet ${FACT_SHEETS_FOLDER}/${meta.ficha}.md does not exist`,
        'ficha',
      ),
    )
  else if (factSheet.status === 'nao-verificado')
    errors.push(
      problem(
        path,
        `${meta.ficha} is ⬜ (unverified); data only cites ✅ or 🟡 fact sheets`,
        'ficha',
      ),
    )
  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, origin: { file: path, ...meta } }
}

/** Two studies with the same DOI would be two fact sheets of one study. */
function duplicateDois(factSheets: ReadonlyArray<FactSheet>): Problem[] {
  const byDoi = new Map<string, FactSheet[]>()
  for (const factSheet of factSheets) {
    if (!factSheet.doi) continue
    byDoi.set(factSheet.doi, [...(byDoi.get(factSheet.doi) ?? []), factSheet])
  }
  return [...byDoi.entries()]
    .filter(([, same]) => same.length > 1)
    .flatMap(([doi, same]) =>
      same
        .slice(1)
        .map((factSheet) =>
          problem(
            factSheet.file,
            `the DOI ${doi} is already in ${same[0]?.file}; a study has a single fact sheet`,
            'link',
          ),
        ),
    )
}

export function factSheetBySlug(
  library: Pick<Library, 'factSheets'>,
  slug: string,
): FactSheet | undefined {
  return library.factSheets.find((f) => f.slug === slug)
}
