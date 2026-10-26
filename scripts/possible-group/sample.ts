// A weighted proportion and its 95% interval under a complex sample design,
// shared by the PNS (`pns.ts`) and the PNAD Contínua (`pnad.ts`) files. Both
// surveys carry a weight, a stratum and a PSU per record.
//
// The browser count keeps its own 1.96 (`packages/rules/src/possible-group.ts`):
// the scripts and the rules package type-check under different settings, and
// no script imports the package.

/** What the variance needs from a record. */
export interface SampleRecord {
  readonly stratum: string
  readonly psu: string
  readonly weight: number
}

/** A weighted proportion with its 95% interval, as the CSVs write it. */
export interface Proportion {
  readonly p: number
  readonly p_min: number
  readonly p_max: number
  readonly n_registros: number
}

export const Z95 = 1.96

/**
 * The ratio p = Σwy / Σw and its variance by linearization: the residual
 * z = w(y − p)/Σw summed per PSU, and the variance between PSUs within each
 * stratum. A stratum with a single PSU in the domain does not contribute.
 */
export function estimate<R extends SampleRecord>(
  domain: ReadonlyArray<R>,
  y: (r: R) => boolean,
): { p: number; variance: number } {
  const total = domain.reduce((s, r) => s + r.weight, 0)
  const p = domain.reduce((s, r) => s + (y(r) ? r.weight : 0), 0) / total
  const byStratum = new Map<string, Map<string, number>>()
  for (const r of domain) {
    const psus = byStratum.get(r.stratum) ?? new Map<string, number>()
    byStratum.set(r.stratum, psus)
    const z = (r.weight * ((y(r) ? 1 : 0) - p)) / total
    psus.set(r.psu, (psus.get(r.psu) ?? 0) + z)
  }
  let variance = 0
  for (const psus of byStratum.values()) {
    const n = psus.size
    if (n < 2) continue
    const zs = [...psus.values()]
    const mean = zs.reduce((s, z) => s + z, 0) / n
    variance += (n / (n - 1)) * zs.reduce((s, z) => s + (z - mean) ** 2, 0)
  }
  return { p, variance }
}

/** The weighted proportion of `y` in the domain, with the 95% interval of
 * the sample design. */
export function proportion<R extends SampleRecord>(
  domain: ReadonlyArray<R>,
  y: (r: R) => boolean,
): Proportion {
  const { p, variance } = estimate(domain, y)
  const error = Z95 * Math.sqrt(variance)
  return {
    p,
    p_min: Math.max(0, p - error),
    p_max: Math.min(1, p + error),
    n_registros: domain.length,
  }
}
