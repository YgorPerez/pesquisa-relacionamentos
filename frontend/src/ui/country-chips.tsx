// The Guide's one row of country chips (#470): the countries its charts
// carry, Brazil first. A chip lights that country in every chart that has
// it and dims the rest; tapping it again, or "Todos", turns it off. The
// choice lives in `?pais=` (`state/country.ts`).
import type { ChartCountry } from '#/content/chart-view'
import { useChooseCountry, useChosenCountry } from '#/state/country'
import { Toggle } from '@/ui/shadcn/toggle'
import { CHART_COPY } from './visual-chart.copy'

export function CountryChips({
  countries,
}: {
  countries: ReadonlyArray<ChartCountry>
}) {
  const chosen = useChosenCountry(countries.map((c) => c.slug))
  const choose = useChooseCountry()
  return (
    <div
      role="group"
      aria-labelledby="t-paises"
      className="mt-md"
      data-slot="paises"
    >
      <p id="t-paises" className="m-0 mb-xs font-label text-label">
        {CHART_COPY.chips}
      </p>
      <div className="flex flex-wrap gap-xs">
        <Toggle pressed={chosen === null} onPressedChange={() => choose(null)}>
          {CHART_COPY.allCountries}
        </Toggle>
        {countries.map((country) => (
          <Toggle
            key={country.slug}
            pressed={chosen === country.slug}
            onPressedChange={(pressed) => choose(pressed ? country.slug : null)}
          >
            {country.name}
          </Toggle>
        ))}
      </div>
    </div>
  )
}
