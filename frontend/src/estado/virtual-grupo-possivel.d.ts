// O módulo que o plugin `vite/grupo-possivel.ts` monta no build.
declare module 'virtual:grupo-possivel' {
  import type { Estimativa } from '@tem-estudo/regras/grupo-possivel'
  import type { LugarDoPacote } from '@tem-estudo/regras/grupo-possivel-dados'
  const grupoPossivel: {
    /** `/dados/grupo-possivel/<versão>`: onde ficam os pacotes `<lugar>.json`. */
    readonly base: string
    /** Os lugares com pacote: `BR` e as UFs que os dados trazem. */
    readonly lugares: ReadonlyArray<LugarDoPacote>
    /** A conta de quem não disse nada: Brasil, sem Perfil, Requisitos padrão. */
    readonly exemplo: Estimativa
  }
  export default grupoPossivel
}
