// How long each deploy step took, and the total, modeled on the Festival dos
// Macacos (`frontend/scripts/cronometro.ts` there): `vps.ts` and
// `check-live.ts` write a line at the end of each step, so one deploy can be
// compared with another by the log (ADR 0009).
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it
// strips.

/** `12.3 s` under a minute, `1 min 22 s` from there up. */
export function duration(ms: number) {
  // Round before choosing the format: 59.96 s would become `60.0 s`.
  const tenths = Math.round(ms / 100)
  if (tenths < 600) return `${(tenths / 10).toFixed(1)} s`
  const whole = Math.round(ms / 1000)
  return `${Math.floor(whole / 60)} min ${whole % 60} s`
}

/** A stopwatch that starts now. `step` runs the step and, if it ends well (a
 * promise, when it resolves), says how long it took; a step's error goes on
 * without a line. `total` says the time since the stopwatch started. */
export function stopwatch(
  say: (line: string) => void,
  now: () => number = () => performance.now(),
) {
  const start = now()
  return {
    step<T>(name: string, run: () => T): T {
      const begin = now()
      const sayTheTime = () => say(`${name} took ${duration(now() - begin)}.`)
      const result = run()
      if (result instanceof Promise) {
        return result.then((value: unknown) => {
          sayTheTime()
          return value
        }) as T
      }
      sayTheTime()
      return result
    },
    total() {
      say(`Total: ${duration(now() - start)}.`)
    },
  }
}
