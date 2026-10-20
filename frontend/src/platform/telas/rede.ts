// A rede dos testes de tela (ADR 0035), pelo MSW. O único `fetch` das telas
// é o dos pacotes do Grupo possível (`estado/pacotes-do-grupo.ts`), e aqui
// eles saem dos dados de fixture, montados pelo mesmo `montarPacotes` do
// build (`vite/grupo-possivel.ts`). Um pedido sem resposta escrita falha o
// teste (`telas.ts`): a tela não sai para a rede de verdade.
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { resolve } from 'node:path'
import grupoPossivel from 'virtual:grupo-possivel'
import { montarPacotes } from '../../../vite/grupo-possivel.ts'

const DADOS = resolve(
  import.meta.dirname,
  '../../../e2e/acervo/dados/grupo-possivel',
)

let montados: ReturnType<typeof montarPacotes> | undefined
const pacotes = () => (montados ??= montarPacotes(DADOS)).pacotes

const PACOTE = `${grupoPossivel.base}/:arquivo`

export const servidor = setupServer(
  http.get(PACOTE, ({ params }) => {
    const lugar = String(params.arquivo).replace(/\.json$/, '')
    const texto = pacotes().get(lugar as never)
    return texto
      ? new HttpResponse(texto, {
          headers: { 'content-type': 'application/json' },
        })
      : new HttpResponse(null, { status: 404 })
  }),
)

/** Os pacotes do Grupo possível não chegam: o aparelho está sem rede, até o
 * fim do teste ou até o `voltar`. */
export function semRede() {
  servidor.use(http.get(PACOTE, () => HttpResponse.error()))
  return { voltar: () => servidor.resetHandlers() }
}
