// O módulo que o plugin `vite/grupo-possivel.ts` monta no build.
declare module 'virtual:grupo-possivel' {
  import type { Estimate } from '@tem-estudo/rules/possible-group'
  import type { PackPlace } from '@tem-estudo/rules/possible-group-data'
  const grupoPossivel: {
    /** `/dados/grupo-possivel/<versão>`: onde ficam os pacotes `<lugar>.json`. */
    readonly base: string
    /** Os lugares com pacote: `BR` e as UFs que os dados trazem. */
    readonly lugares: ReadonlyArray<PackPlace>
    /** A conta de quem não disse nada: Brasil, sem Perfil, Requisitos padrão. */
    readonly exemplo: Estimate
  }
  export default grupoPossivel
}
