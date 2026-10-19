// O acervo inteiro: lê as pastas do repositório e devolve o modelo tipado ou
// a lista de erros do build. A leitura do disco fica em `lerArquivos`; o
// resto (`montarAcervo`) é função pura sobre textos, e é ela que recebe as
// regras entre arquivos (DOI repetido agora; referências, Temas e sitemap
// nos tickets seguintes).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { lerFicha, type Ficha } from './ficha.ts'
import { problema, type Problema } from './problemas.ts'

/** Um arquivo de conteúdo, com o caminho relativo à raiz (`estudos/x.md`). */
export interface Arquivo {
  readonly caminho: string
  readonly texto: string
}

export interface Acervo {
  /** As Fichas em ordem de slug. */
  readonly fichas: ReadonlyArray<Ficha>
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

const ehItem = (nome: string) => nome.endsWith('.md') && !nome.startsWith('_')

/** Lê do disco os arquivos de conteúdo de uma raiz de repositório. */
export function lerArquivos(raiz: string): ReadonlyArray<Arquivo> {
  const pasta = join(raiz, PASTA_FICHAS)
  if (!existsSync(pasta)) return []
  return readdirSync(pasta)
    .filter(ehItem)
    .sort()
    .map((nome) => ({
      caminho: `${PASTA_FICHAS}/${nome}`,
      texto: readFileSync(join(pasta, nome), 'utf8'),
    }))
}

/** Monta o acervo a partir dos textos, sem tocar no disco. */
export function montarAcervo(arquivos: ReadonlyArray<Arquivo>): Resultado {
  const erros: Problema[] = []
  const avisos: Problema[] = []
  const fichas: Ficha[] = []

  for (const arquivo of arquivos) {
    if (!arquivo.caminho.startsWith(`${PASTA_FICHAS}/`)) continue
    const nome = arquivo.caminho.slice(PASTA_FICHAS.length + 1)
    if (!ehItem(nome) || nome.includes('/')) continue
    const lida = lerFicha(arquivo.caminho, arquivo.texto)
    if (lida.ok) fichas.push(lida.ficha)
    else erros.push(...lida.erros)
  }

  fichas.sort((a, b) => a.slug.localeCompare(b.slug))
  erros.push(...doisRepetidos(fichas))

  return erros.length > 0
    ? { ok: false, erros, avisos }
    : { ok: true, acervo: { fichas }, avisos }
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
