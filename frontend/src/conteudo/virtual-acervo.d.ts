// O módulo que o plugin `vite/acervo.ts` monta no build.
declare module 'virtual:acervo' {
  import type { Library } from '@tem-estudo/content'
  const acervo: Library
  export default acervo
}
