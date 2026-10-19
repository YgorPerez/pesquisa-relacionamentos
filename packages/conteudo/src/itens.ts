// Tema, Guia e Dica lidos arquivo a arquivo: o frontmatter decodificado e o
// corpo cortado. O que depende de outros arquivos (herança das Fichas,
// referências, Confiança, `ordem`) fica em `publicacao.ts`.
import type { Schema } from 'effect'
import { parse as lerYaml } from 'yaml'
import {
  FrontmatterDica,
  FrontmatterGuia,
  FrontmatterTema,
  type Cobre,
  type Divergencia,
  type Mito,
} from './esquema.ts'
import { ROTAS_RESERVADAS, type Forca } from './listas.ts'
import { dividirFrontmatter, lerCorpo } from './markdown.ts'
import { decodificar, problema, type Problema } from './problemas.ts'

export interface Tema extends FrontmatterTema {
  /** O nome da pasta em `guias/`, que vira o caminho `/<tema>`. */
  readonly slug: string
  readonly arquivo: string
  /** O parágrafo de contexto, em markdown. */
  readonly contexto: string
}

/** Um achado do Guia com o que herdou das Fichas citadas. */
export interface AchadoDoGuia {
  readonly texto: string
  readonly fichas: ReadonlyArray<string>
  /** `pais` do achado ou os países das Fichas, sem repetir. */
  readonly paises: ReadonlyArray<string>
  /** `periodo` do achado ou os períodos das Fichas, juntos. */
  readonly periodo: string
  /** Quem o achado cobre: `[vale_para]` se declarou um recorte, senão o
   * `cobre` de cada Ficha citada. Vale para o Perfil que um deles cobrir. */
  readonly cobre: ReadonlyArray<Cobre>
  /** Se `cobre` veio de `vale_para` (um recorte) e não das Fichas. */
  readonly recorte: boolean
}

export interface Guia
  extends Omit<FrontmatterGuia, 'achados' | 'dicas' | 'mitos' | 'relacionadas'> {
  readonly slug: string
  /** O slug do Tema, a pasta do arquivo. */
  readonly tema: string
  readonly arquivo: string
  readonly achados: ReadonlyArray<AchadoDoGuia>
  readonly dicas: ReadonlyArray<string>
  readonly mitos: ReadonlyArray<Mito>
  readonly relacionadas: ReadonlyArray<string>
  /** O markdown antes do primeiro `##`. Referências como `[@slug-da-ficha]`
   * e o número-chave como `==39% dos casais==`. */
  readonly respostaCurta: string
  readonly variaConformePerfil: string
  readonly limitacoes: string
  /** Todas as Fichas que a página cita, na ordem em que aparecem; o número
   * de cada referência é a posição aqui mais um. */
  readonly fichasCitadas: ReadonlyArray<string>
}

export interface Dica {
  readonly slug: string
  readonly arquivo: string
  readonly texto: string
  readonly fichas: ReadonlyArray<string>
  readonly forca: Forca
  readonly inferencia: boolean
  readonly paises: ReadonlyArray<string>
  readonly periodo: string
  readonly cobre: ReadonlyArray<Cobre>
  readonly recorte: boolean
  /** Uma Dica só vai para o site se todas as Fichas dela forem ✅ ou 🟡. */
  readonly publicada: boolean
  readonly antes?: ReadonlyArray<string>
  readonly seo?: FrontmatterDica['seo']
}

export const SECOES_DO_GUIA = {
  perfil: 'Varia conforme o Perfil?',
  limitacoes: 'Limitações',
} as const

type Lido<T> = { readonly valor: T | null; readonly corpo: string; readonly erros: Problema[] }

function lerFrontmatter<S extends Schema.Decoder<unknown>>(
  esquema: S,
  arquivo: string,
  texto: string,
): Lido<S['Type']> {
  const erros: Problema[] = []
  const { frontmatter, corpo } = dividirFrontmatter(texto)
  if (frontmatter === null) {
    erros.push(problema(arquivo, 'falta o frontmatter (o bloco --- do topo)'))
    return { valor: null, corpo, erros }
  }
  let dados: unknown
  try {
    dados = lerYaml(frontmatter) ?? {}
  } catch (e) {
    erros.push(problema(arquivo, `o frontmatter não é YAML válido: ${(e as Error).message}`))
    return { valor: null, corpo, erros }
  }
  const decodificado = decodificar(esquema, dados, arquivo)
  if (!decodificado.ok) return { valor: null, corpo, erros: [...decodificado.problemas] }
  return { valor: decodificado.valor, corpo, erros }
}

const nomeSemMd = (arquivo: string) => arquivo.replace(/^.*\//, '').replace(/\.md$/, '')

export type ItemLido<T> =
  | { readonly ok: true; readonly item: T }
  | { readonly ok: false; readonly erros: ReadonlyArray<Problema> }

/** `guias/<tema>/_tema.md`. */
export function lerTema(arquivo: string, texto: string): ItemLido<Tema> {
  const slug = arquivo.split('/')[1] ?? ''
  const { valor, corpo, erros } = lerFrontmatter(FrontmatterTema, arquivo, texto)
  const contexto = corpo.trim()
  if (valor && !contexto) erros.push(problema(arquivo, 'falta o parágrafo de contexto no corpo'))
  const reservadas: ReadonlyArray<string> = ROTAS_RESERVADAS
  if (reservadas.includes(slug))
    erros.push(
      problema(
        arquivo,
        `o Tema não pode se chamar "${slug}", que é uma rota do site (${ROTAS_RESERVADAS.join(', ')})`,
      ),
    )
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    erros.push(problema(arquivo, 'o nome da pasta do Tema precisa ser minúsculo, sem acento, com hífen'))
  if (!valor || erros.length > 0) return { ok: false, erros }
  return { ok: true, item: { ...valor, slug, arquivo, contexto } }
}

/** O Guia ainda sem a herança das Fichas: `paises`, `periodo` e `cobre` dos
 * achados e `fichasCitadas` chegam em `publicacao.ts`. */
export type GuiaLido = Omit<Guia, 'achados' | 'fichasCitadas'> & {
  readonly achados: FrontmatterGuia['achados']
}

/** `guias/<tema>/<slug>.md`. */
export function lerGuia(arquivo: string, texto: string): ItemLido<GuiaLido> {
  const [, tema = '', nome = ''] = arquivo.split('/')
  const slug = nomeSemMd(nome)
  const { valor, corpo, erros } = lerFrontmatter(FrontmatterGuia, arquivo, texto)
  const lido = lerCorpo(corpo)
  if (lido.titulo) erros.push(problema(arquivo, 'o Guia não leva título "#": a Pergunta vem de `pergunta`'))
  if (!lido.abertura) erros.push(problema(arquivo, 'falta a resposta curta antes do primeiro "##"'))
  const conhecidas: ReadonlyArray<string> = Object.values(SECOES_DO_GUIA)
  for (const titulo of conhecidas) {
    if (!lido.secoes.some((s) => s.titulo === titulo))
      erros.push(problema(arquivo, `falta a seção "## ${titulo}"`, titulo))
  }
  for (const secao of lido.secoes) {
    if (!conhecidas.includes(secao.titulo))
      erros.push(
        problema(
          arquivo,
          `seção desconhecida "## ${secao.titulo}"; o corpo do Guia tem só a resposta curta, "## ${SECOES_DO_GUIA.perfil}" e "## ${SECOES_DO_GUIA.limitacoes}"`,
          secao.titulo,
        ),
      )
  }
  if (valor) {
    const amarelas = valor.pergunta.match(/==[^=]+==/g) ?? []
    if (amarelas.length > 1)
      erros.push(problema(arquivo, 'a Pergunta leva no máximo uma palavra em amarelo (==palavra==)', 'pergunta'))
  }
  if (!valor || erros.length > 0) return { ok: false, erros }
  const secao = (titulo: string) => lido.secoes.find((s) => s.titulo === titulo)?.markdown ?? ''
  return {
    ok: true,
    item: {
      ...valor,
      slug,
      tema,
      arquivo,
      dicas: valor.dicas ?? [],
      mitos: valor.mitos ?? [],
      relacionadas: valor.relacionadas ?? [],
      respostaCurta: lido.abertura,
      variaConformePerfil: secao(SECOES_DO_GUIA.perfil),
      limitacoes: secao(SECOES_DO_GUIA.limitacoes),
    },
  }
}

export type DicaLida = FrontmatterDica & { readonly slug: string; readonly arquivo: string; readonly texto: string }

/** `dicas/<slug>.md`. */
export function lerDica(arquivo: string, texto: string): ItemLido<DicaLida> {
  const slug = nomeSemMd(arquivo)
  const { valor, corpo, erros } = lerFrontmatter(FrontmatterDica, arquivo, texto)
  const textoDaDica = corpo.trim()
  if (valor && !textoDaDica) erros.push(problema(arquivo, 'falta o texto da Dica no corpo'))
  if (valor && valor.fichas.length === 0)
    erros.push(problema(arquivo, 'uma Dica cita pelo menos uma Ficha', 'fichas'))
  if (valor?.inferencia && valor.forca === 'forte')
    erros.push(problema(arquivo, `uma Inferência tem Força moderada no máximo (veio ${valor.forca})`, 'forca'))
  if (!valor || erros.length > 0) return { ok: false, erros }
  return { ok: true, item: { ...valor, slug, arquivo, texto: textoDaDica } }
}

export type { Divergencia, Mito }
