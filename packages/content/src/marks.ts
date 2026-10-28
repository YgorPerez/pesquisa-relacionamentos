// The marks a Guide's body writes inside a sentence (ADR 0042), with no
// dependency: the page's view imports them without pulling Effect along.

/** `{{brazil}}`: the sentence that follows has Brazilian data. */
export const BRAZIL_MARK = /\{\{brazil\}\}/g

/** `{{you:<finding>}}`: the finding's sample may be the reader's, which the
 * page marks with "vale para você" once it knows the Profile. */
export const YOU_MARK = /\{\{you:([a-z0-9]+(?:-[a-z0-9]+)*)\}\}/g

/** `[[Pew]]` or `[[satisfacao|satisfeitos]]`: a Verbete (#349). Alone, the
 * word is one of the Verbete's forms; with a `|`, the slug comes first and
 * the text the reader sees after it. */
export const TERM_MARK = /\[\[([^\]|\n]+?)(?:\|([^\]\n]+?))?\]\]/g

/** How a form is compared: trimmed, ignoring case. */
export const formKey = (form: string) => form.trim().toLocaleLowerCase('pt-BR')

/** Finds the Verbete of a mark: `[[slug|text]]` by the slug, `[[word]]` by
 * one of its forms or by its slug. The build and the page read a mark the
 * same way. */
export function termFinder<
  T extends { slug: string; forms: ReadonlyArray<string> },
>(
  terms: ReadonlyArray<T>,
): (first: string, shown: string | undefined) => T | undefined {
  const bySlug = new Map(terms.map((t) => [t.slug, t]))
  const byForm = new Map<string, T>()
  for (const term of terms)
    for (const form of term.forms)
      if (!byForm.has(formKey(form))) byForm.set(formKey(form), term)
  return (first, shown) =>
    shown === undefined
      ? (byForm.get(formKey(first)) ?? bySlug.get(first.trim()))
      : bySlug.get(first.trim())
}

/** The text with each Verbete mark turned into the word the reader sees. */
export const withoutTermMarks = (markdown: string): string =>
  markdown.replace(
    TERM_MARK,
    (_, first: string, shown: string | undefined) => shown ?? first,
  )
