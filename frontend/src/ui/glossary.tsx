// The Glossário's entries (#351): each Verbete with its anchor, the general
// definition, how each Study defined it and, for an institution, its
// Studies in the library. The popover's "Ver no Glossário" and a page
// without JS land on the entry's anchor.
import { Link } from '@tanstack/react-router'
import type { TermView } from '#/content/terms-view'
import { cn } from '@/platform/cn'
import { Button } from '@/ui/shadcn/button'
import { Html } from './html'
import { FactSheetLoop } from './fact-sheet-loop'
import { Headline, Notice, Section } from './section'
import {
  BACK_TO_TEXT,
  EACH_STUDY,
  EMPTY_GLOSSARY,
  STUDIES_OF,
} from './term-popover.copy'
import { StudyDefinitions } from './term-popover'

/** Where the reader came from a text: the Verbete to circle, and the way
 * back to the sentence. */
export interface CameFromText {
  readonly slug: string
  readonly backToText: () => void
}

function GlossaryEntry({
  term,
  cameFrom,
}: {
  term: TermView
  cameFrom: CameFromText | null
}) {
  const isTarget = cameFrom?.slug === term.slug
  return (
    <Section
      id={term.slug}
      aria-labelledby={`v-${term.slug}`}
      data-slot="verbete-glossario"
      className="scroll-mt-md"
    >
      {/* The loop goes around the word and its definition, about the size
          of a cited Fact sheet: drawn around a long entry, its margins
          would grow with it. The way back sits right under, in view. */}
      <div
        className={cn(
          'relative isolate -m-2.5 rounded-mao-2 p-2.5 focus:outline-none',
          isTarget && 'verbete-alvo',
        )}
        data-alvo={isTarget || undefined}
        tabIndex={-1}
      >
        {isTarget && <FactSheetLoop />}
        <Headline id={`v-${term.slug}`}>{term.name}</Headline>
        <Html as="p" className="m-0" html={term.definitionHtml} />
        {isTarget && (
          <Button
            variant="underlined"
            className="mt-1.5"
            onClick={cameFrom.backToText}
          >
            {BACK_TO_TEXT}
          </Button>
        )}
      </div>
      <EntryDetails term={term} />
    </Section>
  )
}

/** How each Study defined it, and an institution's Studies. */
function EntryDetails({ term }: { term: TermView }) {
  return (
    <>
      {term.definitions.length > 0 && (
        <div className="mt-sm">
          <p className="m-0 font-label text-label font-bold">{EACH_STUDY}</p>
          <StudyDefinitions definitions={term.definitions} />
        </div>
      )}
      {term.studies.length > 0 && (
        <div className="mt-sm">
          <p className="m-0 font-label text-label font-bold">{STUDIES_OF}</p>
          <ul className="m-0 mt-1 list-none p-0">
            {term.studies.map((study) => (
              <li key={study.slug} className="not-first:mt-xs">
                <Link
                  to="/estudos/$slug"
                  params={{ slug: study.slug }}
                  className="font-bold decoration-agua-tinta hover:bg-agua-fonte"
                >
                  {study.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export function Glossary({
  terms,
  cameFrom = null,
}: {
  terms: ReadonlyArray<TermView>
  cameFrom?: CameFromText | null
}) {
  if (terms.length === 0) return <Notice>{EMPTY_GLOSSARY}</Notice>
  return terms.map((term) => (
    <GlossaryEntry key={term.slug} term={term} cameFrom={cameFrom} />
  ))
}
