// The Guide's chosen country (#470): `?pais=<country>` in the address, so a
// shared link opens with it (ADR 0001; a country is not sensitive). The
// server reads it too and sends the charts already lit. A value that names
// no country of the Guide's charts is ignored.
import { useNavigate, useSearch } from '@tanstack/react-router'
import { readCountry } from '@tem-estudo/rules/country'

/** The chosen country, when `known` (slugs) has it. */
export function useChosenCountry(known: ReadonlyArray<string>): string | null {
  const pais = useSearch({
    strict: false,
    select: (search) => (search as { pais?: unknown }).pais,
  })
  return readCountry(pais, known)
}

/** Chooses a country, or none, in place of the address's: no new history
 * entry and no scroll. */
export function useChooseCountry(): (slug: string | null) => void {
  const navigate = useNavigate()
  return (slug) =>
    void navigate({
      to: '.',
      search: (previous: Record<string, unknown>) => {
        const { pais: _, ...rest } = previous
        return slug ? { ...rest, pais: slug } : rest
      },
      replace: true,
      resetScroll: false,
    })
}
