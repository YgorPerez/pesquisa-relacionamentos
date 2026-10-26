// The Readings in the shape the pages draw (#179): each with its site's name
// and language and its notices, the site's first and then its own. The
// `/sites-vizinhos` page groups them by Topic; a Guide's "Para ler além
// daqui" block takes its Topic's list.
import type {
  Library,
  NoticeKind,
  Notices,
  Reading,
  ReadingLanguage,
} from '@tem-estudo/content'
import { NOTICE_KINDS } from '@tem-estudo/content/lists'
import { topicReadings } from '@tem-estudo/content/queries'

export interface ReadingNotice {
  readonly kind: NoticeKind
  readonly text: string
}

export interface ReadingView {
  readonly url: string
  readonly title: string
  readonly description: string
  /** The site's id: the analytics event carries it. */
  readonly site: string
  readonly siteName: string
  readonly language: ReadingLanguage
  readonly notices: ReadonlyArray<ReadingNotice>
}

export interface ReadingGroup {
  readonly topic: string
  readonly title: string
  readonly readings: ReadonlyArray<ReadingView>
}

type ReadingsLibrary = Pick<Library, 'readings' | 'neighborSites'>

const noticesOf = (notices: Notices | undefined): ReadingNotice[] =>
  NOTICE_KINDS.flatMap((kind) => {
    const text = notices?.[kind]
    return text ? [{ kind, text }] : []
  })

function readingView(reading: Reading, library: ReadingsLibrary): ReadingView {
  const site = library.neighborSites.find((s) => s.id === reading.site)
  // The build already refused a Reading of an unknown site.
  if (!site) throw new Error(`unknown neighbor site ${reading.site}`)
  return {
    url: reading.url,
    title: reading.title,
    description: reading.description,
    site: site.id,
    siteName: site.name,
    language: site.language,
    notices: [...noticesOf(site.notices), ...noticesOf(reading.notices)],
  }
}

/** The Topic's Readings, Portuguese first: the Guide's last block. */
export const topicReadingViews = (
  library: ReadingsLibrary,
  topic: string,
): ReadonlyArray<ReadingView> =>
  topicReadings(library, topic).map((r) => readingView(r, library))

/** The page: one group per Topic, in the Topics' order, and only the Topics
 * that have a Reading. */
export const readingGroups = (
  library: ReadingsLibrary & Pick<Library, 'topics'>,
): ReadonlyArray<ReadingGroup> =>
  library.topics.flatMap((topic) => {
    const readings = topicReadingViews(library, topic.slug)
    return readings.length > 0
      ? [{ topic: topic.slug, title: topic.title, readings }]
      : []
  })
