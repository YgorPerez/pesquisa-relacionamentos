// O acervo inteiro: lê as pastas do repositório e devolve o modelo tipado ou
// a lista de erros do build. A leitura do disco fica em `lerArquivos`; o
// resto (`montarAcervo`) é função pura sobre textos, e é ela que recebe as
// regras entre arquivos (DOI repetido, referências, Confiança, `ordem` dos
// Temas, a Ficha citada pelos dados; o sitemap entra no #29).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { parse as lerYaml } from 'yaml'
import { MetaDados } from './esquema.ts'
import { lerFicha, type Ficha } from './ficha.ts'
import {
  lerDica,
  lerGuia,
  lerTema,
  type Dica,
  type DicaLida,
  type Guia,
  type GuiaLido,
  type ItemLido,
  type Tema,
} from './itens.ts'
import { ligar } from './publicacao.ts'
import {
  ARQUIVO_DE_PRIORIDADES,
  META_DE_PRIORIDADES,
  lerPrioridades,
  type Prioridades,
} from './prioridades.ts'
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
  /** Os Temas em ordem de slug. */
  readonly temas: ReadonlyArray<Tema>
  /** Os Guias Tema a Tema, na `ordem` de cada um. */
  readonly guias: ReadonlyArray<Guia>
  /** Todas as Dicas em ordem de slug, publicadas ou não (`publicada`). */
  readonly dicas: ReadonlyArray<Dica>
  /** Os `.meta.yaml` de `dados/`, em ordem de caminho. */
  readonly dados: ReadonlyArray<OrigemDosDados>
  /** O arquivo de Prioridades, ou `null` enquanto ele não existe. */
  readonly prioridades: Prioridades | null
}

export type Resultado =
  | { readonly ok: true; readonly acervo: Acervo; readonly avisos: ReadonlyArray<Problema> }
  | {
      readonly ok: false
      readonly erros: ReadonlyArray<Problema>
      readonly avisos: ReadonlyArray<Problema>
    }

/** As pastas que o pacote lê. Arquivo que começa com `_` é modelo ou
 * metadado da pasta e não vira item; o `_tema.md` de cada pasta de Guias é o
 * Tema. */
const PASTA_FICHAS = 'estudos'
const PASTA_DICAS = 'dicas'
const PASTA_GUIAS = 'guias'
const ARQUIVO_DO_TEMA = '_tema.md'
/** Os dados das calculadoras. Só os `.meta.yaml` entram: os CSV são grandes
 * e quem os lê é a calculadora. */
const PASTA_DADOS = 'dados'
const SUFIXO_META = '.meta.yaml'

const ehItem = (nome: string) => nome.endsWith('.md') && !nome.startsWith('_')

function lerPasta(raiz: string, pasta: string, aceita: (nome: string) => boolean): Arquivo[] {
  const dir = join(raiz, pasta)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((nome) => aceita(nome) && statSync(join(dir, nome)).isFile())
    .sort()
    .map((nome) => ({ caminho: `${pasta}/${nome}`, texto: readFileSync(join(dir, nome), 'utf8') }))
}

/** Lê do disco os arquivos de conteúdo de uma raiz de repositório. */
export function lerArquivos(raiz: string): ReadonlyArray<Arquivo> {
  const guias = join(raiz, PASTA_GUIAS)
  const temas = existsSync(guias)
    ? readdirSync(guias)
        .filter((nome) => statSync(join(guias, nome)).isDirectory())
        .sort()
    : []
  return [
    ...lerPasta(raiz, PASTA_FICHAS, ehItem),
    ...lerPasta(raiz, PASTA_DICAS, ehItem),
    ...temas.flatMap((tema) =>
      lerPasta(raiz, `${PASTA_GUIAS}/${tema}`, (nome) => ehItem(nome) || nome === ARQUIVO_DO_TEMA),
    ),
    ...lerMetas(raiz),
    ...lerSeExiste(raiz, ARQUIVO_DE_PRIORIDADES),
  ]
}

function lerSeExiste(raiz: string, caminho: string): Arquivo[] {
  const completo = join(raiz, caminho)
  return existsSync(completo) ? [{ caminho, texto: readFileSync(completo, 'utf8') }] : []
}

function lerMetas(raiz: string): Arquivo[] {
  const dados = join(raiz, PASTA_DADOS)
  if (!existsSync(dados)) return []
  return readdirSync(dados, { recursive: true, encoding: 'utf8' })
    .map((c) => c.split('\\').join('/'))
    // Arquivo ou pasta que começa com `_` é rascunho e fica fora do build,
    // como `dicas/_sem-ficha.md`.
    .filter((c) => c.endsWith(SUFIXO_META) && !c.split('/').some((parte) => parte.startsWith('_')))
    .sort()
    .map((c) => ({ caminho: `${PASTA_DADOS}/${c}`, texto: readFileSync(join(dados, c), 'utf8') }))
}

/** Monta o acervo a partir dos textos, sem tocar no disco. */
export function montarAcervo(arquivos: ReadonlyArray<Arquivo>): Resultado {
  const erros: Problema[] = []
  const avisos: Problema[] = []
  const fichas: Ficha[] = []
  const temas: Tema[] = []
  const metas: Arquivo[] = []
  const guias: GuiaLido[] = []
  const dicas: DicaLida[] = []
  let arquivoDePrioridades: Arquivo | null = null

  const quebrados = new Set<string>()
  const guardar = <T>(caminho: string, lido: ItemLido<T>, onde: T[]) => {
    if (lido.ok) onde.push(lido.item)
    else {
      erros.push(...lido.erros)
      quebrados.add(caminho)
    }
  }

  for (const { caminho, texto } of arquivos) {
    const partes = caminho.split('/')
    const nome = partes[partes.length - 1] ?? ''
    if (caminho === ARQUIVO_DE_PRIORIDADES) {
      arquivoDePrioridades = { caminho, texto }
    } else if (partes[0] === PASTA_DADOS && nome.endsWith(SUFIXO_META)) {
      metas.push({ caminho, texto })
    } else if (partes[0] === PASTA_FICHAS && partes.length === 2 && ehItem(nome)) {
      const lida = lerFicha(caminho, texto)
      guardar(caminho, lida.ok ? { ok: true, item: lida.ficha } : lida, fichas)
    } else if (partes[0] === PASTA_DICAS && partes.length === 2 && ehItem(nome)) {
      guardar(caminho, lerDica(caminho, texto), dicas)
    } else if (partes[0] === PASTA_GUIAS && partes.length === 3) {
      if (nome === ARQUIVO_DO_TEMA) guardar(caminho, lerTema(caminho, texto), temas)
      else if (ehItem(nome)) guardar(caminho, lerGuia(caminho, texto), guias)
    }
  }

  fichas.sort((a, b) => a.slug.localeCompare(b.slug))
  temas.sort((a, b) => a.slug.localeCompare(b.slug))
  dicas.sort((a, b) => a.slug.localeCompare(b.slug))
  erros.push(...doisRepetidos(fichas))

  const ligados = ligar({ fichas, temas, guias, dicas, quebrados })
  erros.push(...ligados.erros)

  const dados: OrigemDosDados[] = []
  for (const meta of [...metas].sort((a, b) => a.caminho.localeCompare(b.caminho))) {
    const lida = lerMeta(meta, fichas)
    if (lida.ok) dados.push(lida.origem)
    else erros.push(...lida.erros)
  }

  let prioridades: Prioridades | null = null
  if (arquivoDePrioridades) {
    const lidas = lerPrioridades(
      arquivoDePrioridades.caminho,
      arquivoDePrioridades.texto,
      fichas,
      metas.some((m) => m.caminho === META_DE_PRIORIDADES),
    )
    if (lidas.ok) prioridades = lidas.prioridades
    else erros.push(...lidas.erros)
  }

  return erros.length > 0
    ? { ok: false, erros, avisos }
    : {
        ok: true,
        acervo: { fichas, temas: ligados.temas, guias: ligados.guias, dicas: ligados.dicas, dados, prioridades },
        avisos,
      }
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
