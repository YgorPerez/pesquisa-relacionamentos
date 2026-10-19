// A interface do pacote de conteúdo: carregar o acervo e derivar dele
// caminhos e indexação. Puro, sem DOM e sem rede; só `lerArquivos` toca no
// disco.
export {
  carregarAcervo,
  fichaPorSlug,
  lerArquivos,
  montarAcervo,
  type Acervo,
  type Arquivo,
  type OrigemDosDados,
  type Resultado,
} from './acervo.ts'
export { caminhoDaFicha, fichaIndexavel } from './caminhos.ts'
export type { Cobre, Seo } from './esquema.ts'
export {
  CASAIS,
  DESENHOS,
  FORCAS,
  GENEROS,
  PROCURA,
  STATUS,
  type Desenho,
  type Forca,
  type Status,
} from './listas.ts'
export type { Achado, Ficha } from './ficha.ts'
export type { Secao } from './markdown.ts'
export { formatarProblemas, type Problema } from './problemas.ts'
