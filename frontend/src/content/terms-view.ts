// The Verbetes (#351; GLOSSARY: Verbete) in the shape the pages draw. On the
// server, a mark becomes a link to its entry in `/glossario`, which is what
// a page without JS shows, carrying the Fact sheets its sentence cites; the
// popover (`ui/term-popover.tsx`) reads those and the page's `TermView`s.
import type { Library, Term } from '@tem-estudo/content'
import { termFinder, TERM_MARK } from '@tem-estudo/content/marks'
import { GLOSSARY_PATH } from '@tem-estudo/content/paths'
import { inlineHtml } from './view'
import type { SafeHtml } from './safe-html'

/** A Verbete's anchor in the Glossário. */
export const termHref = (slug: string) => `${GLOSSARY_PATH}#${slug}`

/** How one Study defined the Verbete, from its Fact sheet's Definições. */
export interface StudyDefinition {
  readonly factSheet: string
  readonly title: string
  readonly html: SafeHtml
}

export interface TermView {
  readonly slug: string
  readonly name: string
  readonly definitionHtml: SafeHtml
  readonly variesByStudy: boolean
  /** Every Fact sheet that defines it, in slug order. */
  readonly definitions: ReadonlyArray<StudyDefinition>
  /** For an institution, its Studies in the library. */
  readonly studies: ReadonlyArray<{
    readonly slug: string
    readonly title: string
  }>
}

export function termView(term: Term, library: Library): TermView {
  return {
    slug: term.slug,
    name: term.name,
    definitionHtml: inlineHtml(term.definition),
    variesByStudy: term.variesByStudy,
    definitions: library.factSheets.flatMap((f) =>
      f.definitions
        .filter((d) => d.term === term.slug)
        .map((d) => ({
          factSheet: f.slug,
          title: f.title,
          html: inlineHtml(d.text),
        })),
    ),
    studies: term.institution
      ? library.factSheets
          .filter((f) => f.institution === term.slug)
          .map((f) => ({ slug: f.slug, title: f.title }))
      : [],
  }
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}
const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c)

const REFERENCE = /\[@([a-z0-9-]+)\]/g
/** Cuts after the end of a sentence, keeping the space in the pieces. */
const SENTENCES = /(?<=[.!?…])(\s+)/

/** Turns the marks a page writes into links, sentence by sentence; `used`
 * collects the Verbetes, for the page to send their views along. On a Fact
 * sheet's page, `own` is the Study every sentence speaks of. A mark the
 * build would not take stays as its word. */
export function withTermLinks(
  markdown: string,
  terms: ReadonlyArray<Term>,
  used: Set<string>,
  own?: string,
): string {
  if (!markdown.includes('[[')) return markdown
  const find = termFinder(terms)
  return markdown
    .split(SENTENCES)
    .map((sentence) => {
      const cited = own
        ? [own]
        : [...new Set([...sentence.matchAll(REFERENCE)].map((m) => m[1] ?? ''))]
      return sentence.replace(
        TERM_MARK,
        (_, first: string, shown: string | undefined) => {
          const word = shown ?? first
          const term = find(first, shown)
          if (!term) return word
          used.add(term.slug)
          return `<a class="verbete" href="${termHref(term.slug)}" data-verbete="${term.slug}" data-fichas="${cited.join(' ')}">${escape(word)}</a>`
        },
      )
    })
    .join('')
}

/** The views of the Verbetes a page marked, by slug. */
export const pageTerms = (
  used: ReadonlySet<string>,
  library: Library,
): Readonly<Record<string, TermView>> =>
  Object.fromEntries(
    library.terms
      .filter((t) => used.has(t.slug))
      .map((t) => [t.slug, termView(t, library)] as const),
  )

/** The Glossário: every Verbete, in alphabetical order. */
export const glossaryView = (library: Library): ReadonlyArray<TermView> =>
  [...library.terms]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((t) => termView(t, library))
