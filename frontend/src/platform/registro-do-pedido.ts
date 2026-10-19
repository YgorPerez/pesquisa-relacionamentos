// O registro de cada pedido no servidor (ADR 0001). O link de
// compartilhamento leva o Perfil na query, e o log do app guarda só método,
// caminho, status e tempo: `GET /grupo-possivel 200 12ms`. A query e o
// fragmento ficam de fora, e o `Referer` e os cookies nunca entram na linha.
//
// Toda resposta sai com `Referrer-Policy: strict-origin`, para a query não
// ir junto quando o visitante abre um Estudo externo. Os arquivos do
// `public/` não passam por aqui, e o vhost do Nginx põe o mesmo cabeçalho
// neles (`../../nginx/temestudo.conf`).

type Fetch<Resto extends unknown[]> = (
  request: Request,
  ...resto: Resto
) => Response | Promise<Response>

export const REFERRER_POLICY = 'strict-origin'

type Opcoes = {
  /** Onde a linha vai. No servidor, o stdout que o `docker logs` lê. */
  escrever?: (linha: string) => void
  /** Milissegundos de um relógio que só anda para a frente. */
  agora?: () => number
}

/** Embrulha o `fetch` do servidor. `resto` são as opções que o Start passa
 * depois do pedido, que seguem como vieram. */
export function comRegistro<Resto extends unknown[]>(
  fetch: Fetch<Resto>,
  { escrever = console.log, agora = () => performance.now() }: Opcoes = {},
): (request: Request, ...resto: Resto) => Promise<Response> {
  return async (request, ...resto) => {
    const inicio = agora()
    const linha = (status: number) =>
      `${request.method} ${new URL(request.url).pathname} ${status} ${Math.round(agora() - inicio)}ms`
    let resposta: Response
    try {
      resposta = await fetch(request, ...resto)
    } catch (erro) {
      escrever(linha(500))
      throw erro
    }
    escrever(linha(resposta.status))
    return comReferrerPolicy(resposta)
  }
}

/** O `Response.redirect` e o `fetch` devolvem cabeçalhos imutáveis: nesses,
 * a resposta é copiada com os cabeçalhos novos. */
function comReferrerPolicy(resposta: Response): Response {
  try {
    resposta.headers.set('referrer-policy', REFERRER_POLICY)
    return resposta
  } catch {
    const headers = new Headers(resposta.headers)
    headers.set('referrer-policy', REFERRER_POLICY)
    return new Response(resposta.body, {
      status: resposta.status,
      statusText: resposta.statusText,
      headers,
    })
  }
}
