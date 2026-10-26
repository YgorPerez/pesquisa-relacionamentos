// The Readings (#179; GLOSSARY: Leitura): pages of Neighbor sites that cite
// the studies they discuss. The `/sites-vizinhos` page lists them by Topic,
// and each Guide ends with its Topic's in "Para ler além daqui". A Reading
// is not a Source: no green ink (that is the way to a Fact sheet) and no
// rating, only the site, the line for the reader and the notices, in ink and
// paper. Each link opens another tab and counts its site, never more.
import { countEvent } from '#/analytics/counting'
import { EVENTS } from '#/analytics/events'
import type { ReadingView } from '#/content/neighbor-sites-view'
import { Headline, Section, SmallLink, Tag } from './section'
import {
  ALL_NEIGHBOR_SITES,
  FURTHER_READING,
  FURTHER_READING_LINE,
  LANGUAGE_NOTE,
  NEW_TAB,
  NOTICE_TAG,
} from './readings.copy'

/** The arrow that leaves the page, drawn like the site's other arrows. */
const OutArrow = () => (
  <svg
    className="ml-1 inline-block align-baseline"
    width="18"
    height="16"
    viewBox="0 0 18 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 14C5 8 9 4.5 15 3M15 3l-5.5-1M15 3l-1.5 5.5" />
  </svg>
)

function ReadingItem({ reading }: { reading: ReadingView }) {
  const language = LANGUAGE_NOTE[reading.language]
  return (
    <li
      className="py-md not-first:border-t-(length:--traco-etiqueta) not-first:fio-pontilhado not-first:border-tinta"
      data-slot="leitura-vizinha"
    >
      <p className="m-0 text-label leading-label text-tinta-2">
        <span className="text-tinta">{reading.siteName}</span>
        {language && <span className="font-normal"> · {language}</span>}
      </p>
      <a
        href={reading.url}
        target="_blank"
        rel="noopener"
        onClick={() => countEvent(EVENTS.neighborSite(reading.site))}
        className="mt-1 inline-block py-1 font-title text-title text-pretty hover:bg-amarelo-voce"
      >
        {reading.title}
        <OutArrow />
        <span className="sr-only"> {NEW_TAB}</span>
      </a>
      <p className="mt-xs mb-0">{reading.description}</p>
      {reading.notices.length > 0 && (
        <ul className="mt-sm mb-0 list-none p-0" data-slot="avisos">
          {reading.notices.map((notice) => (
            <li
              key={notice.kind}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-nota leading-nota text-tinta-2 not-first:mt-xs"
            >
              <Tag>{NOTICE_TAG[notice.kind]}</Tag>
              <span>{notice.text}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

/** A list of Readings, in the order given (Portuguese first). */
export function ReadingList({
  readings,
}: {
  readings: ReadonlyArray<ReadingView>
}) {
  return (
    <ul className="m-0 list-none p-0" data-slot="leituras-vizinhas">
      {readings.map((reading) => (
        <ReadingItem key={reading.url} reading={reading} />
      ))}
    </ul>
  )
}

/** "Para ler além daqui", the Guide's last text block, after "O que não se
 * sabe". The page leaves it out when the Topic has no Reading. */
export function FurtherReading({
  readings,
}: {
  readings: ReadonlyArray<ReadingView>
}) {
  return (
    <Section id="para-ler-alem-daqui" aria-labelledby="t-para-ler-alem-daqui">
      <Headline id="t-para-ler-alem-daqui">{FURTHER_READING}</Headline>
      <p className="m-0 text-nota leading-nota text-tinta-2">
        {FURTHER_READING_LINE}
      </p>
      <ReadingList readings={readings} />
      <SmallLink to="/sites-vizinhos">{ALL_NEIGHBOR_SITES}</SmallLink>
    </Section>
  )
}
