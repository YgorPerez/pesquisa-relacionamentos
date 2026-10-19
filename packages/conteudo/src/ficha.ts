// Uma Ficha: o frontmatter decodificado mais o corpo cortado nas seções
// que o site desenha (O que mediu, Achados, Limitações).
import { parse as lerYaml } from 'yaml'
import { FrontmatterFicha } from './esquema.ts'
import {
  dividirFrontmatter,
  lerCorpo,
  primeiraTabela,
  type Secao,
} from './markdown.ts'
import { decodificar, problema, type Problema } from './problemas.ts'

/** Uma linha da tabela de Achados. */
export interface Achado {
  readonly medida: string
  readonly valor: string
  /** O localizador no original: página, tabela, seção. */
  readonly onde: string
  /** O trecho literal do original, ou `null` enquanto ninguém o conferiu. */
  readonly trecho: string | null
  /** O script que reproduz um número calculado (#6). */
  readonly calculo: string | null
}

export interface Ficha extends FrontmatterFicha {
  /** O nome do arquivo sem `.md`, que vira o caminho `/estudos/<slug>`. */
  readonly slug: string
  /** Caminho do arquivo a partir da raiz do repositório. */
  readonly arquivo: string
  /** O `#` do corpo: "Autor (ano): tema". */
  readonly titulo: string
  /** O DOI tirado do `link`, em minúsculas, ou `null` se o link não é DOI. */
  readonly doi: string | null
  readonly oQueMediu: string
  readonly achados: ReadonlyArray<Achado>
  /** O markdown da seção Achados fora da tabela (notas antes e depois). */
  readonly notasDosAchados: string
  /** Seções a mais, entre Achados e Limitações, na ordem do arquivo. */
  readonly outrasSecoes: ReadonlyArray<Secao>
  readonly limitacoes: string
  /** Só Relatórios e pesquisas internas; o site não mostra. */
  readonly comoUsamos: string | null
}

export const SECOES = {
  oQueMediu: 'O que mediu',
  achados: 'Achados',
  limitacoes: 'Limitações',
  comoUsamos: 'Como usamos',
} as const

const COLUNAS = ['Medida', 'Valor', 'Onde', 'Trecho'] as const
const COLUNA_CALCULO = 'Cálculo'

export function doiDoLink(link: string): string | null {
  const achado = /^https?:\/\/(?:dx\.)?doi\.org\/(10\.\S+)$/i.exec(link)
  return achado?.[1] ? decodeURIComponent(achado[1]).toLowerCase() : null
}

export type FichaLida =
  | { readonly ok: true; readonly ficha: Ficha }
  | { readonly ok: false; readonly erros: ReadonlyArray<Problema> }

/** Lê o texto de um arquivo `estudos/<slug>.md`. */
export function lerFicha(arquivo: string, texto: string): FichaLida {
  const slug = arquivo.replace(/^.*\//, '').replace(/\.md$/, '')
  const erros: Problema[] = []
  const { frontmatter, corpo } = dividirFrontmatter(texto)

  let dados: unknown = null
  if (frontmatter === null) {
    erros.push(problema(arquivo, 'falta o frontmatter (o bloco --- do topo)'))
  } else {
    try {
      dados = lerYaml(frontmatter) ?? {}
    } catch (e) {
      erros.push(
        problema(
          arquivo,
          `o frontmatter não é YAML válido: ${(e as Error).message}`,
        ),
      )
    }
  }

  const decodificado =
    dados === null ? null : decodificar(FrontmatterFicha, dados, arquivo)
  if (decodificado && !decodificado.ok) erros.push(...decodificado.problemas)

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    erros.push(
      problema(
        arquivo,
        'o nome do arquivo precisa ser minúsculo, sem acento, com hífen',
      ),
    )

  const lido = lerCorpo(corpo)
  if (!lido.titulo)
    erros.push(
      problema(arquivo, 'falta o título "# Autor (ano): tema" no corpo'),
    )

  const secao = (titulo: string) => lido.secoes.find((s) => s.titulo === titulo)
  for (const titulo of [SECOES.oQueMediu, SECOES.achados, SECOES.limitacoes]) {
    if (!secao(titulo))
      erros.push(problema(arquivo, `falta a seção "## ${titulo}"`, titulo))
  }

  const achados: Achado[] = []
  let notasDosAchados = ''
  const secaoAchados = secao(SECOES.achados)
  if (secaoAchados) {
    const tabela = primeiraTabela(secaoAchados.markdown)
    const esperado = COLUNAS.join(' | ')
    if (!tabela) {
      erros.push(
        problema(arquivo, `falta a tabela | ${esperado} |`, SECOES.achados),
      )
    } else {
      const cabecalho = tabela.cabecalho
      const certo =
        COLUNAS.every((c, i) => cabecalho[i] === c) &&
        (cabecalho.length === COLUNAS.length ||
          (cabecalho.length === COLUNAS.length + 1 &&
            cabecalho[4] === COLUNA_CALCULO))
      if (!certo) {
        erros.push(
          problema(
            arquivo,
            `a tabela precisa das colunas | ${esperado} | (e | ${COLUNA_CALCULO} | opcional), veio | ${cabecalho.join(' | ')} |`,
            SECOES.achados,
          ),
        )
      } else {
        tabela.linhas.forEach((linha, i) => {
          const [
            medida = '',
            valor = '',
            onde = '',
            trecho = '',
            calculo = '',
          ] = linha
          if (!medida || !valor)
            erros.push(
              problema(
                arquivo,
                `a linha ${i + 1} da tabela precisa de Medida e Valor`,
                SECOES.achados,
              ),
            )
          achados.push({
            medida,
            valor,
            onde,
            trecho: trecho || null,
            calculo: calculo || null,
          })
        })
      }
      notasDosAchados = [tabela.antes, tabela.depois]
        .filter(Boolean)
        .join('\n\n')
    }
  }

  if (decodificado?.ok) {
    const fm = decodificado.valor
    if (fm.status !== 'nao-verificado') {
      if (!fm.verificado_em)
        erros.push(
          problema(
            arquivo,
            'uma Ficha ok ou parcial precisa da data da conferência',
            'verificado_em',
          ),
        )
    }
    if (fm.status === 'ok') {
      achados.forEach((a, i) => {
        if (!a.trecho)
          erros.push(
            problema(
              arquivo,
              `a linha ${i + 1} ("${a.medida}") está sem Trecho; uma Ficha ok cita o original em cada achado`,
              SECOES.achados,
            ),
          )
      })
    }
    const idades = fm.cobre.idades
    if (idades && idades.min > idades.max)
      erros.push(
        problema(
          arquivo,
          `min (${idades.min}) passa de max (${idades.max})`,
          'cobre.idades',
        ),
      )
  }

  if (erros.length > 0 || !decodificado?.ok || !lido.titulo)
    return { ok: false, erros }

  const conhecidas: ReadonlyArray<string> = Object.values(SECOES)
  return {
    ok: true,
    ficha: {
      ...decodificado.valor,
      slug,
      arquivo,
      titulo: lido.titulo,
      doi: doiDoLink(decodificado.valor.link),
      oQueMediu: secao(SECOES.oQueMediu)?.markdown ?? '',
      achados,
      notasDosAchados,
      outrasSecoes: lido.secoes.filter((s) => !conhecidas.includes(s.titulo)),
      limitacoes: secao(SECOES.limitacoes)?.markdown ?? '',
      comoUsamos: secao(SECOES.comoUsamos)?.markdown ?? null,
    },
  }
}
