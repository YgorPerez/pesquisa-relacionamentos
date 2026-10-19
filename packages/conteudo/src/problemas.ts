// Os erros e avisos do build, com o arquivo e o campo, em PT-BR.
import { Result, Schema, SchemaIssue } from 'effect'

export interface Problema {
  /** Caminho relativo à raiz do repositório, como `estudos/joel-2020.md`. */
  readonly arquivo: string
  /** O campo do frontmatter (`cobre.generos.0`) ou a seção do corpo. */
  readonly campo?: string
  /** A frase inteira, já com arquivo e campo, pronta para o terminal. */
  readonly mensagem: string
}

export function problema(
  arquivo: string,
  texto: string,
  campo?: string,
): Problema {
  const onde = campo ? `${arquivo}: ${campo}` : arquivo
  return { arquivo, ...(campo ? { campo } : {}), mensagem: `${onde}: ${texto}` }
}

/** Uma linha por problema, para o build mostrar de uma vez. */
export function formatarProblemas(problemas: ReadonlyArray<Problema>): string {
  return problemas.map((p) => `- ${p.mensagem}`).join('\n')
}

const formatar = SchemaIssue.makeFormatterStandardSchemaV1()

const lido = (valor: unknown, caminho: ReadonlyArray<PropertyKey>): unknown =>
  caminho.reduce<unknown>(
    (atual, chave) =>
      atual !== null && typeof atual === 'object'
        ? (atual as Record<PropertyKey, unknown>)[chave]
        : undefined,
    valor,
  )

/** As mensagens do Effect, em inglês, viram frases do repositório. */
function traduzir(original: string, valor: unknown): string {
  const mostrado = valor === undefined ? '' : ` (veio ${JSON.stringify(valor)})`
  // Num campo opcional o Effect diz "Expected X | undefined".
  const mensagem = original.replace(/ \| undefined$/, '')
  if (mensagem === 'Expected number') return `precisa ser um número${mostrado}`
  if (mensagem === 'Missing key') return 'campo obrigatório ausente'
  if (mensagem === 'Expected no excess property') return 'campo desconhecido'
  const lista = /^Expected ((?:(?:"[^"]*"|-?\d+)(?: \| )?)+)$/.exec(mensagem)
  if (lista?.[1]) {
    const opcoes = lista[1].split(' | ').map((o) => o.replace(/"/g, ''))
    return `valor fora da lista fechada (${opcoes.join(' | ')})${mostrado}`
  }
  if (mensagem === 'Expected an integer')
    return `precisa ser um número inteiro${mostrado}`
  if (mensagem === 'Expected string') return `precisa ser texto${mostrado}`
  if (mensagem === 'Expected boolean')
    return `precisa ser true ou false${mostrado}`
  if (mensagem === 'Expected array') return `precisa ser uma lista${mostrado}`
  if (mensagem === 'Expected object') return `precisa ser um objeto${mostrado}`
  return `${mensagem}${mostrado}`
}

export type Decodificado<T> =
  | { readonly ok: true; readonly valor: T }
  | { readonly ok: false; readonly problemas: ReadonlyArray<Problema> }

/** Decodifica com o esquema, recusando campo desconhecido, e devolve todos os
 * problemas de uma vez. */
export function decodificar<S extends Schema.Decoder<unknown>>(
  esquema: S,
  valor: unknown,
  arquivo: string,
): Decodificado<S['Type']> {
  const resultado = Schema.decodeUnknownResult(esquema)(valor, {
    errors: 'all',
    onExcessProperty: 'error',
  })
  if (Result.isSuccess(resultado)) return { ok: true, valor: resultado.success }
  const falha = formatar(resultado.failure.issue)
  return {
    ok: false,
    problemas: falha.issues.map((issue) => {
      const caminho = (issue.path ?? []).map((p) =>
        typeof p === 'object' && p !== null && 'key' in p ? p.key : p,
      )
      return problema(
        arquivo,
        traduzir(issue.message, lido(valor, caminho)),
        caminho.length > 0 ? caminho.map(String).join('.') : undefined,
      )
    }),
  }
}
