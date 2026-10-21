// The possible group's numbers written for people: 2 digits, no false
// precision (#8, story 43). They serve the page, the B5 card (#32) and the
// link preview (#34). The output is interface text, in Portuguese.

type Mode = 'nearest' | 'down' | 'up'

const ROUND: Record<Mode, (x: number) => number> = {
  nearest: Math.round,
  down: Math.floor,
  up: Math.ceil,
}

/** Rounds to 2 significant digits (below 100, to the unit). */
export function round2(x: number, mode: Mode = 'nearest'): number {
  if (x < 100) return ROUND[mode](x)
  const step = 10 ** (Math.floor(Math.log10(x)) - 1)
  return ROUND[mode](x / step) * step
}

/** "1,9", "45": up to one decimal place, with the Brazilian comma. */
export const decimal = (x: number) =>
  x.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

function write(v: number): string {
  if (v < 1000) return String(v)
  if (v < 1e6) return `${decimal(v / 1e3)} mil`
  const m = v / 1e6
  return `${decimal(m)} ${m < 2 ? 'milhão' : 'milhões'}`
}

/** "750 mil", "1,5 milhão". Below one person, "menos de 1"; zero is
 * "ninguém". */
export function formatAmount(x: number): string {
  if (x <= 0) return 'ninguém'
  if (x < 1) return 'menos de 1'
  return write(round2(x))
}

/** "entre 160 mil e 200 mil": the range always contains the count's interval. */
export function formatRange(min: number, max: number): string {
  const from = round2(Math.max(0, min), 'down')
  const to = round2(Math.max(0, max), 'up')
  return from === to
    ? `cerca de ${write(from)}`
    : `entre ${write(from)} e ${write(to)}`
}

/** "×3,4", "×13". */
export function formatTimes(times: number): string {
  if (!Number.isFinite(times)) return 'de ninguém para alguém'
  return times >= 10
    ? `×${Math.round(times)}`
    : `×${decimal(Math.round(times * 10) / 10)}`
}

/** "+670", "+48 mil". */
export const formatGain = (gain: number): string =>
  `+${gain < 1 ? '0' : write(round2(gain))}`
