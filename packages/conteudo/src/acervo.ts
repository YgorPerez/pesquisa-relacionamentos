// O acervo inteiro: lê as pastas do repositório e devolve o modelo tipado ou
// a lista de erros do build. A leitura do disco fica em `lerArquivos`; o
// resto (`montarAcervo`) é função pura sobre textos, e é ela que recebe as
// regras entre arquivos (DOI repetido e a Ficha citada pelos dados agora;
// referências dos Guias, Temas e sitemap nos tickets seguintes).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as lerYaml } from 'yaml'
import { MetaDados } from './esquema.ts'
import { lerFicha, type Ficha } from './ficha.ts'
import { decodificar, problema, type Problema } from './problemas.ts'

/** Um arquivo de conteúdo, com o caminho relativo à raiz (`estudos/x.md`). */
export interface Arquivo {
  readonly caminho: string
  readonly texto: string
}

/** A origem de um arquivo de dados, lida do seu `.meta.yaml`. */
export interface OrigemDosDados extends MetaDados {
  /** Caminho do `.meta.yaml` a partir da raiz do repositório. */
  readonly arquivo: string
}

export interface Acervo {
  /** As Fichas em ordem de slug. */
  readonly fichas: ReadonlyArray<Ficha>
  /** Os `.meta.yaml` de `dados/`, em ordem de caminho. */
  readonly dados: ReadonlyArray<OrigemDosDados>
}

export type Resultado =
  | { readonly ok: true; readonly acervo: Acervo; readonly avisos: ReadonlyArray<Problema> }
  | {
      readonly ok: false
      readonly erros: ReadonlyArray<Problema>
      readonly avisos: ReadonlyArray<Problema>
    }

/** As pastas que o pacote lê. Arquivo que começa com `_` é modelo ou
 * metadado da pasta e não vira item. */
const PASTA_FICHAS = 'estudos'
/** Os dados das calculadoras. Só os `.meta.yaml` entram: os CSV são grandes
 * e quem os lê é a calculadora. */
const PASTA_DADOS = 'dados'
const SUFIXO_META = '.meta.yaml'

const ehItem = (nome: string) => nome.endsWith('.md') && !nome.startsWith('_')

/** Lê do disco os arquivos de conteúdo de uma raiz de repositório. */
export function lerArquivos(raiz: string): ReadonlyArray<Arquivo> {
  const arquivos: Arquivo[] = []
  const pasta = join(raiz, PASTA_FICHAS)
  if (existsSync(pasta)) {
    for (const nome of readdirSync(pasta).filter(ehItem).sort())
      arquivos.push({ caminho: `${PASTA_FICHAS}/${nome}`, texto: readFileSync(join(pasta, nome), 'utf8') })
  }
  const dados = join(raiz, PASTA_DADOS)
  if (existsSync(dados)) {
    const metas = readdirSync(dados, { recursive: true, encoding: 'utf8' })
      .map((c) => c.split('\\').join('/'))
      .filter((c) => c.endsWith(SUFIXO_META))
      .sort()
    for (const caminho of metas)
      arquivos.push({ caminho: `${PASTA_DADOS}/${caminho}`, texto: readFileSync(join(dados, caminho), 'utf8') })
  }
  return arquivos
}

/** Monta o acervo a partir dos textos, sem tocar no disco. */
export function montarAcervo(arquivos: ReadonlyArray<Arquivo>): Resultado {
  const erros: Problema[] = []
  const avisos: Problema[] = []
  const fichas: Ficha[] = []
  const metas: Arquivo[] = []

  for (const arquivo of arquivos) {
    if (arquivo.caminho.startsWith(`${PASTA_DADOS}/`) && arquivo.caminho.endsWith(SUFIXO_META)) {
      metas.push(arquivo)
      continue
    }
    if (!arquivo.caminho.startsWith(`${PASTA_FICHAS}/`)) continue
    const nome = arquivo.caminho.slice(PASTA_FICHAS.length + 1)
    if (!ehItem(nome) || nome.includes('/')) continue
    const lida = lerFicha(arquivo.caminho, arquivo.texto)
    if (lida.ok) fichas.push(lida.ficha)
    else erros.push(...lida.erros)
  }

  fichas.sort((a, b) => a.slug.localeCompare(b.slug))
  erros.push(...doisRepetidos(fichas))

  const dados: OrigemDosDados[] = []
  for (const meta of [...metas].sort((a, b) => a.caminho.localeCompare(b.caminho))) {
    const lida = lerMeta(meta, fichas)
    if (lida.ok) dados.push(lida.origem)
    else erros.push(...lida.erros)
  }

  return erros.length > 0
    ? { ok: false, erros, avisos }
    : { ok: true, acervo: { fichas, dados }, avisos }
}

/** Lê e monta: o que o build e o app chamam. */
export function carregarAcervo(raiz: string): Resultado {
  return montarAcervo(lerArquivos(raiz))
}

type MetaLida =
  | { readonly ok: true; readonly origem: OrigemDosDados }
  | { readonly ok: false; readonly erros: ReadonlyArray<Problema> }

/** Um número só publica com Ficha ✅ ou 🟡, como uma afirmação (#10). */
function lerMeta({ caminho, texto }: Arquivo, fichas: ReadonlyArray<Ficha>): MetaLida {
  let valor: unknown
  try {
    valor = lerYaml(texto) ?? {}
  } catch (e) {
    return { ok: false, erros: [problema(caminho, `não é YAML válido: ${(e as Error).message}`)] }
  }
  const decodificado = decodificar(MetaDados, valor, caminho)
  if (!decodificado.ok) return { ok: false, erros: decodificado.problemas }
  const meta = decodificado.valor
  const erros: Problema[] = []
  if (!meta.tabela?.length && !meta.variaveis?.length)
    erros.push(problema(caminho, 'diga a tabela ou as variáveis de onde os dados saíram'))
  const ficha = fichaPorSlug({ fichas }, meta.ficha)
  if (!ficha) erros.push(problema(caminho, `não existe a Ficha ${PASTA_FICHAS}/${meta.ficha}.md`, 'ficha'))
  else if (ficha.status === 'nao-verificado')
    erros.push(
      problema(caminho, `${meta.ficha} é ⬜ (não verificada); dados só citam Ficha ✅ ou 🟡`, 'ficha'),
    )
  return erros.length > 0 ? { ok: false, erros } : { ok: true, origem: { arquivo: caminho, ...meta } }
}

/** Dois Estudos com o mesmo DOI viram duas Fichas do mesmo estudo. */
function doisRepetidos(fichas: ReadonlyArray<Ficha>): Problema[] {
  const porDoi = new Map<string, Ficha[]>()
  for (const ficha of fichas) {
    if (!ficha.doi) continue
    porDoi.set(ficha.doi, [...(porDoi.get(ficha.doi) ?? []), ficha])
  }
  return [...porDoi.entries()]
    .filter(([, mesmas]) => mesmas.length > 1)
    .flatMap(([doi, mesmas]) =>
      mesmas.slice(1).map((ficha) =>
        problema(
          ficha.arquivo,
          `o DOI ${doi} já está em ${mesmas[0]?.arquivo}; um Estudo tem uma Ficha só`,
          'link',
        ),
      ),
    )
}

export function fichaPorSlug(acervo: Pick<Acervo, 'fichas'>, slug: string): Ficha | undefined {
  return acervo.fichas.find((f) => f.slug === slug)
}
