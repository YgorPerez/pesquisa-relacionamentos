// O acervo inteiro: lê as pastas do repositório e devolve o modelo tipado ou
// a lista de erros do build. A leitura do disco fica em `lerArquivos`; o
// resto (`montarAcervo`) é função pura sobre textos, e é ela que recebe as
// regras entre arquivos (DOI repetido, referências, Confiança, `ordem` dos
// Temas; o sitemap entra no #29).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
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
import { problema, type Problema } from './problemas.ts'

/** Um arquivo de conteúdo, com o caminho relativo à raiz (`estudos/x.md`). */
export interface Arquivo {
  readonly caminho: string
  readonly texto: string
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
  ]
}

/** Monta o acervo a partir dos textos, sem tocar no disco. */
export function montarAcervo(arquivos: ReadonlyArray<Arquivo>): Resultado {
  const erros: Problema[] = []
  const avisos: Problema[] = []
  const fichas: Ficha[] = []
  const temas: Tema[] = []
  const guias: GuiaLido[] = []
  const dicas: DicaLida[] = []

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
    if (partes[0] === PASTA_FICHAS && partes.length === 2 && ehItem(nome)) {
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

  return erros.length > 0
    ? { ok: false, erros, avisos }
    : {
        ok: true,
        acervo: { fichas, temas: ligados.temas, guias: ligados.guias, dicas: ligados.dicas },
        avisos,
      }
}

/** Lê e monta: o que o build e o app chamam. */
export function carregarAcervo(raiz: string): Resultado {
  return montarAcervo(lerArquivos(raiz))
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

export function fichaPorSlug(acervo: Acervo, slug: string): Ficha | undefined {
  return acervo.fichas.find((f) => f.slug === slug)
}
