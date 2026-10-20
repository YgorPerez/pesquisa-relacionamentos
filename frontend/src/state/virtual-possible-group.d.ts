// The module the `vite/possible-group.ts` plugin builds.
declare module 'virtual:possible-group' {
  import type { Estimate } from '@tem-estudo/rules/possible-group'
  import type { PackPlace } from '@tem-estudo/rules/possible-group-data'
  const possibleGroup: {
    /** `/dados/grupo-possivel/<version>`: where the `<place>.json` packs are. */
    readonly base: string
    /** The places with a pack: `BR` and the states the data has. */
    readonly places: ReadonlyArray<PackPlace>
    /** The count for someone who said nothing: Brazil, no Profile, default
     * Requirements. */
    readonly example: Estimate
  }
  export default possibleGroup
}
