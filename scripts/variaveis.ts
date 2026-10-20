// As variáveis de ambiente do repositório, lidas e validadas com o T3 Env
// (ADR 0032, no molde do `env.server.ts` do Festival dos Macacos). Quem lê:
// `./portas.ts` (as portas de cada uso), `frontend/vite/ambiente.ts` (as do
// build: o acervo, o sitemap e a contagem em localhost) e
// `frontend/scripts/vps.ts` (a VPS e o login do GoatCounter).
//
// Cada tipo é um Standard Schema escrito à mão, que o `createEnv` aceita por
// chave: o app não usa Effect (spec #23), e um zod só para isto pesaria mais
// que as poucas linhas daqui. Chave em branco (como o `.env.example` deixa)
// conta como ausente, e o espaço em volta sai.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { createEnv, type StandardSchemaV1 } from '@t3-oss/env-core'
import { statSync } from 'node:fs'
import { resolve } from 'node:path'

type Esquema<Saida> = StandardSchemaV1<unknown, Saida>

/** Um tipo de variável: `padrao` quando ela falta, senão o que `converter`
 * tirar do texto sem o espaço em volta, ou o erro com o `esperado`. */
function variavel<Saida>(
  esperado: string,
  padrao: Saida,
  converter: (valor: string) => Saida | undefined,
): Esquema<Saida> {
  return {
    '~standard': {
      version: 1,
      vendor: 'tem-estudo',
      validate(bruto) {
        if (bruto === undefined) return { value: padrao }
        const valor = typeof bruto === 'string' ? bruto.trim() : undefined
        const convertido = valor ? converter(valor) : undefined
        return convertido === undefined
          ? { issues: [{ message: `esperado ${esperado}` }] }
          : { value: convertido }
      },
    },
  }
}

/** Uma porta TCP. */
export const porta = (padrao: number) =>
  variavel('uma porta, de 1 a 65535', padrao, (valor) => {
    const numero = Number(valor)
    return /^\d+$/.test(valor) && numero >= 1 && numero <= 65_535
      ? numero
      : undefined
  })

const ehPasta = (caminho: string) =>
  statSync(caminho, { throwIfNoEntry: false })?.isDirectory() ?? false
const ehArquivo = (caminho: string) =>
  statSync(caminho, { throwIfNoEntry: false })?.isFile() ?? false

/** Uma pasta que existe, relativa a `base`. Ausente, `base`/`padrao`. */
export const pasta = (base: string, padrao: string) =>
  variavel('uma pasta que existe', resolve(base, padrao), (valor) => {
    const caminho = resolve(base, valor)
    return ehPasta(caminho) ? caminho : undefined
  })

/** Um arquivo que existe, relativo a `base`, ou nada. */
export const arquivoOpcional = (base: string) =>
  variavel<string | undefined>('um arquivo que existe', undefined, (valor) => {
    const caminho = resolve(base, valor)
    return ehArquivo(caminho) ? caminho : undefined
  })

/** Um usuário de sistema, como o do SSH na VPS. */
export const usuario = (padrao: string) =>
  variavel('um usuário (minúsculas, números, _ e -)', padrao, (valor) =>
    /^[a-z_][a-z0-9_-]*$/.test(valor) ? valor : undefined,
  )

/** Um e-mail, como o do login do GoatCounter, ou nada. */
export const emailOpcional = variavel<string | undefined>(
  'um e-mail',
  undefined,
  (valor) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) ? valor : undefined),
)

/** Um liga-desliga, `1` ou `0`, como o `VITE_CONTAR_EM_LOCALHOST`. */
export const ligada = (padrao: boolean) =>
  variavel('1 ou 0', padrao, (valor) =>
    valor === '1' ? true : valor === '0' ? false : undefined,
  )

type Esquemas = Record<string, Esquema<unknown>>
type Lidas<E extends Esquemas> = {
  [Nome in keyof E]: StandardSchemaV1.InferOutput<E[Nome]>
}

/** Lê de `fonte` as variáveis de `esquemas`, ou lança uma mensagem só, com
 * cada variável errada, o valor que veio e o que se esperava. */
export function lerVariaveis<E extends Esquemas>(
  esquemas: E,
  fonte: Record<string, string | undefined>,
): Lidas<E> {
  // Cópia: o `emptyStringAsUndefined` apaga as chaves em branco do objeto.
  const runtimeEnv = { ...fonte }
  const lidas = createEnv({
    server: esquemas,
    runtimeEnv,
    isServer: true,
    emptyStringAsUndefined: true,
    onValidationError(problemas) {
      const linhas = problemas.map((problema) => {
        const [chave] = problema.path ?? []
        const nome = String(
          typeof chave === 'object' && chave !== null ? chave.key : chave,
        )
        return `  ${nome}=${JSON.stringify(fonte[nome])}: ${problema.message}`
      })
      throw new Error(`Variáveis de ambiente inválidas:\n${linhas.join('\n')}`)
    },
  })
  // Um objeto simples, e não o Proxy do T3 Env: quem recebe compara e espalha.
  return { ...lidas } as Lidas<E>
}
