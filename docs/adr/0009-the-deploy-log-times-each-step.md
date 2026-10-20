# The deploy log gives the time of each step

As in the Festival (its `cronometro.ts`), `vps.ts` writes a line at the end of each plan step, `[vps] Swap took 14.2 s.`, and the total at the end. `check-live.ts` writes its own. Comparing two deploys by the log shows which step got slower, something the Actions step time, a single number for the whole publish, does not show.

## Consequences

- The step that fails does not write a time: its error goes on as it was.
- The steps have the plan's names (`Upload`, `Image`, `GoatCounter`, `Swap`). Changing a name changes what one searches for in the log.
