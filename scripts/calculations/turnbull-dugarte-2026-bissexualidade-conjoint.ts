// The proportions the article gives as decimals (pp. 851 and 855), shown as
// percentages. Each key is one Achados row.
//
//   node scripts/calculations/turnbull-dugarte-2026-bissexualidade-conjoint.ts <key>
//
// self-report: men's baseline in the direct question of Study I (p. 851).
// list: men's baseline in the double-list experiment of Study I (p. 851).
// conjoint: heterosexual profiles' share of positive selections in Study II,
//   and the eight-point penalty over it (p. 855).
// baselines: women's and men's share of positive selections in Study II (p. 855).
const percent = (p: number) => `${Math.round(p * 100)}%`

const rows: Record<string, () => string> = {
  'self-report': () => `men ${percent(0.42)}`,
  list: () => `men ${percent(0.37)}`,
  conjoint: () =>
    `heterosexual profile ${percent(0.46)}; 0.08 / 0.46 = ${percent(0.08 / 0.46)}`,
  baselines: () => `women ${percent(0.35)}, men ${percent(0.56)}`,
}

const row = rows[process.argv[2] ?? '']
if (!row) {
  console.error(
    `usage: turnbull-dugarte-2026-bissexualidade-conjoint.ts <${Object.keys(rows).join('|')}>`,
  )
  process.exit(1)
}
console.log(row())
