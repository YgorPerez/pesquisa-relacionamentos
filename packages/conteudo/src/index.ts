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
} from './acervo.ts'
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
} from './busca.ts'
export {
  caminhoDaDica,
  caminhoDaFicha,
  caminhoDoGuia,
  caminhoDoTema,
  fichaIndexavel,
} from './caminhos.ts'
export {
  dicaPorSlug,
  dicaPublicada,
  guiaPorSlug,
  guiasComADica,
  guiasDoTema,
  temaPorSlug,
} from './consultas.ts'
export type { Cobre, Divergencia, Mito, Seo } from './esquema.ts'
export type { AchadoDoGuia, Dica, Guia, Tema } from './itens.ts'
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
} from './listas.ts'
export type { Achado, Ficha } from './ficha.ts'
export type {
  Caracteristica,
  CelulaDePrioridade,
  Prioridades,
  SatisfacaoExplicada,
} from './prioridades.ts'
export type { Secao } from './markdown.ts'
export { referenciasNoTexto } from './publicacao.ts'
export { formatarProblemas, type Problema } from './problemas.ts'
