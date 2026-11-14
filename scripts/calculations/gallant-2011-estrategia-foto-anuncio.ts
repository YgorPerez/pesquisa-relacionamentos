// Gallant et al. (2011): each trait was coded 1 (present) or 0 (absent) in
// each photo, so the mean the article gives (M = .75) is the share of photos
// with the trait. This prints those shares as percentages. The p values are
// copied as they are from the same sentence of the article, so that the row's
// Valor can give them next to the shares.
//
//   node scripts/calculations/gallant-2011-estrategia-foto-anuncio.ts <trait>
//
// <trait>: smile, grey-hair, camera-angle, outdoors, minimal-clothing,
// others-in-photo. The means and p values are on pp. 113-115.
const percent = (mean: number) => `${Math.round(mean * 100)}%`

type Line = ReadonlyArray<readonly [string, number] | string>

const traits: Record<string, Line> = {
  // p. 113: women M = .75, men M = .59; relationship type p = .42.
  smile: [['mulheres', 0.75], ['homens', 0.59], 'tipo de relação p = 0.42'],
  // p. 114: men M = .03, women M = 0.0; sex p = .03; relationship type p = .73.
  'grey-hair': [['homens', 0.03], 'sexo p = 0.03', 'tipo de relação p = 0.73'],
  // p. 114: men M = .12, women M = .04; sex p = .01; relationship type p = .85.
  'camera-angle': [
    ['homens', 0.12],
    ['mulheres', 0.04],
    'sexo p = 0.01',
    'tipo de relação p = 0.85',
  ],
  // p. 114: men M = .32, women M = .17; sex p = .003; relationship type p = .94.
  outdoors: [
    ['homens', 0.32],
    ['mulheres', 0.17],
    'sexo p = 0.003',
    'tipo de relação p = 0.94',
  ],
  // p. 114: women M = .13, men M = .03; intimate M = .14 against dating, p = .01;
  // relationship M = .06.
  'minimal-clothing': [
    ['mulheres', 0.13],
    ['homens', 0.03],
    ['intimate', 0.14],
    'intimate contra dating p = 0.01',
    ['relationship', 0.06],
  ],
  // p. 115: intimate M = .12, dating M = .26 (p = .01), relationship M = .23
  // (p = .05); sex p = .19.
  'others-in-photo': [
    ['intimate', 0.12],
    ['dating', 0.26],
    'intimate contra dating p = 0.01',
    ['relationship', 0.23],
    'intimate contra relationship p = 0.05',
    'sexo p = 0.19',
  ],
}

const trait = process.argv[2] ?? ''
const line = traits[trait]
if (!line) {
  console.error(
    `unknown trait "${trait}"; use one of: ${Object.keys(traits).join(', ')}`,
  )
  process.exit(1)
}
console.log(
  line
    .map((part) =>
      typeof part === 'string' ? part : `${part[0]} ${percent(part[1])}`,
    )
    .join('; '),
)
