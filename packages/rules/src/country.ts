// The country filter of a Guide's charts (#470): `?pais=<country>` in the
// query, in Portuguese like the rest of the link (ADR 0039), and Brazil,
// highlighted for everyone. A country is not sensitive (ADR 0001).

/** Brazil's value in the link; its points are highlighted with or without a
 * chosen country. */
export const BRAZIL = 'brasil'

/** The country as the link writes it: lowercase, without accents, with
 * hyphens ("Estados Unidos" → `estados-unidos`). */
export function countrySlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** The `?pais=` value, when it names a country the Guide's charts carry
 * (`known`, already as slugs); anything else is ignored. */
export function readCountry(
  value: unknown,
  known: ReadonlyArray<string>,
): string | null {
  if (typeof value !== 'string') return null
  const slug = countrySlug(value)
  return known.includes(slug) ? slug : null
}
