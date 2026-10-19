// As tabelas do SIDRA pela API de agregados do IBGE
// (https://servicodados.ibge.gov.br/api/docs/agregados?versao=3).

export interface ValorSidra {
  /** Código da localidade: `1` para o Brasil, 2 dígitos para UF, 7 para município. */
  readonly local: string
  readonly nome: string
  /** O código da categoria em cada classificação, na ordem do pedido. */
  readonly categorias: ReadonlyArray<string>
  readonly valor: number
}

const API = 'https://servicodados.ibge.gov.br/api/v3/agregados'

export function urlSidra(
  tabela: number,
  variavel: number,
  localidades: string,
  classificacoes: ReadonlyArray<string>,
): string {
  return `${API}/${tabela}/periodos/2022/variaveis/${variavel}?localidades=${localidades}&classificacao=${classificacoes.join('|')}`
}

/** Pede uma consulta e devolve um valor por localidade × combinação de categorias. */
export async function buscarSidra(
  tabela: number,
  variavel: number,
  localidades: string,
  classificacoes: ReadonlyArray<string>,
): Promise<ValorSidra[]> {
  const url = urlSidra(tabela, variavel, localidades, classificacoes)
  for (let tentativa = 1; ; tentativa++) {
    const resposta = await fetch(url)
    if (resposta.ok) return lerRespostaSidra(await resposta.json())
    if (tentativa >= 4) throw new Error(`SIDRA ${tabela} respondeu ${resposta.status}: ${url}`)
    await new Promise((r) => setTimeout(r, 2000 * tentativa))
  }
}

interface RespostaSidra {
  readonly resultados: ReadonlyArray<{
    readonly classificacoes: ReadonlyArray<{ readonly categoria: Readonly<Record<string, string>> }>
    readonly series: ReadonlyArray<{
      readonly localidade: { readonly id: string; readonly nome: string }
      readonly serie: Readonly<Record<string, string>>
    }>
  }>
}

/** "-" é zero no SIDRA; "X" (sigilo) e "..." (não disponível) param o pipeline. */
export function lerRespostaSidra(json: unknown): ValorSidra[] {
  const [variavel] = json as ReadonlyArray<RespostaSidra>
  if (!variavel) throw new Error('resposta do SIDRA sem variável')
  const valores: ValorSidra[] = []
  for (const resultado of variavel.resultados) {
    const categorias = resultado.classificacoes.map((c) => Object.keys(c.categoria)[0] ?? '')
    for (const s of resultado.series) {
      const texto = s.serie['2022'] ?? ''
      const valor = texto === '-' ? 0 : Number(texto)
      if (!Number.isFinite(valor) || texto === '')
        throw new Error(`valor "${texto}" no SIDRA para ${s.localidade.nome} ${categorias.join('/')}`)
      valores.push({ local: s.localidade.id, nome: s.localidade.nome, categorias, valor })
    }
  }
  return valores
}
