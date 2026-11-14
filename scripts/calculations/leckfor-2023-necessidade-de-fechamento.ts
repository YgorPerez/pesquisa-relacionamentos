// Leckfor et al. (2023), Journal of Social and Personal Relationships
// 40(8):2422-2444. Numbers copied from the article.
//
//   node scripts/calculations/leckfor-2023-necessidade-de-fechamento.ts
//     the internal checks the Limitações section quotes: Cohen's d for the
//     Study 3 comparisons from the means, SDs and group sizes the article
//     prints, next to t / sqrt(n), which is what the printed d values match;
//     and, for Study 2, the d the paired means and SDs allow
const comma = (n: number, digits: number) => n.toFixed(digits).replace('.', ',')

interface Group {
  readonly mean: number
  readonly sd: number
  readonly n: number
}

// Study 3, Results: the three recall conditions.
const ghosted: Group = { mean: 2.45, sd: 1.08, n: 183 }
const included: Group = { mean: 5.9, sd: 0.78, n: 190 }
const rejected: Group = { mean: 2.81, sd: 1.04, n: 172 }
const participants = 545

function cohensD(a: Group, b: Group): number {
  const pooled = Math.sqrt(
    ((a.n - 1) * a.sd ** 2 + (b.n - 1) * b.sd ** 2) / (a.n + b.n - 2),
  )
  return Math.abs(a.mean - b.mean) / pooled
}

const comparisons: Array<[string, Group, number, number]> = [
  ['ignorados contra incluídos', included, 34.35, 1.47],
  ['ignorados contra rejeitados diretamente', rejected, 3.59, 0.15],
]
for (const [name, other, t, printed] of comparisons) {
  const d = cohensD(ghosted, other)
  const fromT = t / Math.sqrt(participants)
  console.log(
    `Estudo 3, ${name}: d pelas médias = ${comma(d, 2)}; t / raiz(n) = ${comma(fromT, 2)}; o artigo imprime d = ${comma(printed, 2)}`,
  )
}

// Study 2, Results: ghosting intentions (M = 2.86, SD = 1.22) and direct
// rejection intentions (M = 4.57, SD = 1.25), the same 411 people; the
// printed paired test is t(410) = 17.30, d = 1.53.
const difference = 4.57 - 2.86
const averageSd = (1.22 + 1.25) / 2
const n = 411
const t = 17.3
console.log(
  `Estudo 2, terminar falando contra sumir: d pelas médias e desvios = ${comma(difference / averageSd, 2)}; t / raiz(n) = ${comma(t / Math.sqrt(n), 2)}; o artigo imprime d = 1,53`,
)
