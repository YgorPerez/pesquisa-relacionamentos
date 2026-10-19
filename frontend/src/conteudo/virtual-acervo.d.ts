// O módulo que o plugin `vite/acervo.ts` monta no build.
declare module 'virtual:acervo' {
  import type { Acervo } from '@tem-estudo/conteudo'
  const acervo: Acervo
  export default acervo
}
