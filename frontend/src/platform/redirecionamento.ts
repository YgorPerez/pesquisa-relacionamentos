// Um caminho só por página (#15): com barra final, responde 301 para o sem
// barra; caminho que está no `antes` de algum arquivo, 301 para o de hoje.
// A query segue junto, para o link compartilhado abrir o mesmo estado. O
// `Location` é relativo: atrás do Nginx, o app não sabe o domínio.

type Fetch<Resto extends unknown[]> = (
  request: Request,
  ...resto: Resto
) => Response | Promise<Response>

/** O mapa é o de `redirecionamentos(acervo)` do pacote de conteúdo. */
export function comRedirecionamentos<Resto extends unknown[]>(
  mapa: Readonly<Record<string, string>>,
  fetch: Fetch<Resto>,
): (request: Request, ...resto: Resto) => Promise<Response> {
  return async (request, ...resto) => {
    const url = new URL(request.url)
    // `//outro.com/` não pode virar `Location: //outro.com`.
    const limpo = url.pathname.replace(/^\/+/, '/')
    const semBarra = limpo.length > 1 ? limpo.replace(/\/+$/, '') || '/' : limpo
    const destino = Object.hasOwn(mapa, semBarra) ? mapa[semBarra] : semBarra
    if (destino && destino !== url.pathname)
      return new Response(null, { status: 301, headers: { location: `${destino}${url.search}` } })
    return fetch(request, ...resto)
  }
}
