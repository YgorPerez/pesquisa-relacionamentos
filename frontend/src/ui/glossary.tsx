// The Glossário's entries (#351): each Verbete with its anchor, the general
// definition, how each Study defined it and, for an institution, its
// Studies in the library. The popover's "Ver no Glossário" and a page
// without JS land on the entry's anchor.
import { Link } from '@tanstack/react-router'
import type { TermView } from '#/content/terms-view'
import { Html } from './guide'
import { Headline, Notice, Section } from './section'
import { EACH_STUDY, EMPTY_GLOSSARY, STUDIES_OF } from './term-popover.copy'
import { StudyDefinitions } from './term-popover'

function GlossaryEntry({ term }: { term: TermView }) {
  return (
    <Section
      id={term.slug}
      aria-labelledby={`v-${term.slug}`}
      data-slot="verbete-glossario"
      className="scroll-mt-md"
    >
      <Headline id={`v-${term.slug}`}>{term.name}</Headline>
      <Html as="p" className="m-0" html={term.definitionHtml} />
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
    </Section>
  )
}

export function Glossary({ terms }: { terms: ReadonlyArray<TermView> }) {
  if (terms.length === 0) return <Notice>{EMPTY_GLOSSARY}</Notice>
  return terms.map((term) => <GlossaryEntry key={term.slug} term={term} />)
}
