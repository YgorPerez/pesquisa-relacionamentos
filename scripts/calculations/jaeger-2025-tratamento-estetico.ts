// Study 2, Results (p. 664): 481 men in the final sample; the share open to
// each relationship type (90.44%, 80.04%, 60.29%) and the share who would
// consider someone who had aesthetic treatment for it (98.16%, 93.50%,
// 82.76%). The text does not say which base the second set uses. This checks
// whether a whole count over the 481 men reproduces each published share, and
// which count over the men open to that type comes closest.
//
//   node scripts/calculations/jaeger-2025-tratamento-estetico.ts
const sample = 481

const types = [
  { name: 'friendship', open: 90.44, consider: 98.16 },
  { name: 'casual dating', open: 80.04, consider: 93.5 },
  { name: 'serious relationship', open: 60.29, consider: 82.76 },
] as const

const pct = (n: number, d: number) => Math.round((10_000 * n) / d) / 100
const fmt = (p: number) => p.toFixed(2)
const nearest = (d: number, published: number) =>
  Math.round((published * d) / 100)

for (const t of types) {
  const open = nearest(sample, t.open)
  const overSample = Array.from({ length: sample + 1 }, (_, n) => n).filter(
    (n) => pct(n, sample) === t.consider,
  )
  const consider = nearest(open, t.consider)
  console.log(
    `${t.name}: open ${open} of ${sample} = ${fmt(pct(open, sample))}%; ` +
      `published ${fmt(t.consider)}% over ${sample}: ` +
      `${overSample.length ? overSample.join('/') : 'no whole count'}; ` +
      `over the ${open} open: ${consider} of ${open} = ${fmt(pct(consider, open))}%`,
  )
}
