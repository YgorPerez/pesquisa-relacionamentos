// The module the `vite/library.ts` plugin builds.
declare module 'virtual:library' {
  import type { Library } from '@tem-estudo/content'
  const library: Library
  export default library
}
