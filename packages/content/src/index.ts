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
  type Opcoes,
  type OrigemDosDados,
  type Resultado,
} from './library.ts'
export {
  buscaDaDica,
  buscaDaFicha,
  buscaDoGuia,
  buscaDoTema,
  caminhosDoSitemap,
  LIMITES,
  ORIGEM,
  redirecionamentos,
  robotsTxt,
  sitemapXml,
  textoPuro,
  type Busca,
} from './search.ts'
export {
  caminhoDaDica,
  caminhoDaFicha,
  caminhoDoGuia,
  caminhoDoTema,
  fichaIndexavel,
} from './paths.ts'
export {
  dicaPorSlug,
  dicaPublicada,
  guiaPorSlug,
  guiasComADica,
  guiasDoTema,
  temaPorSlug,
} from './queries.ts'
export type { Cobre, Divergencia, Mito, Seo } from './schema.ts'
export type { AchadoDoGuia, Dica, Guia, Tema } from './items.ts'
export {
  CALCULADORAS,
  CASAIS,
  DESENHOS,
  FORCAS,
  GENEROS,
  PROCURA,
  ROTAS_RESERVADAS,
  STATUS,
  type Calculadora,
  type Desenho,
  type Forca,
  type Status,
} from './lists.ts'
export type { Achado, Ficha } from './fact-sheet.ts'
export type {
  Caracteristica,
  CelulaDePrioridade,
  Prioridades,
  SatisfacaoExplicada,
} from './priorities.ts'
export type { Secao } from './markdown.ts'
export { referenciasNoTexto } from './publication.ts'
export { formatarProblemas, type Problema } from './problems.ts'
