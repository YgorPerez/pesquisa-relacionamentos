// O envio ao GoatCounter de stats.temestudo.cloud (#35). Este arquivo é "o
// script" da contagem: `contagem.ts` só o importa quando o visitante pode ser
// contado, e com GPC, DNT ou a chave desligada ele nem chega ao navegador.
//
// Não usamos o `count.js` do GoatCounter porque ele manda sempre o
// `location.search`, e a query do link leva o Perfil (ADR 0001). Aqui o
// pedido leva só o caminho, a referência sem query, a largura da tela e a
// marca de robô, no mesmo formato do `count.js` (`/count?p=…&r=…&s=…`). O
// país sai do IP no próprio GoatCounter, que não guarda o IP.

export interface Contagem {
  /** O caminho da página (`/grupo-possivel`) ou o nome do evento. */
  readonly caminho: string
  readonly evento?: boolean
  /** De onde o visitante veio, só na primeira página da visita. */
  readonly referencia?: string
  readonly largura: number
  /** O código de robô do `count.js` (153 = `navigator.webdriver`); 0 se não. */
  readonly robo: number
  /** Fura o cache do navegador. */
  readonly rnd: string
}

const semQuery = (texto: string) => texto.replace(/[?#].*$/s, '')

function referenciaSemQuery(
  referencia: string | undefined,
): string | undefined {
  if (!referencia) return undefined
  try {
    const url = new URL(referencia)
    return `${url.origin}${url.pathname}`
  } catch {
    return undefined
  }
}

export function urlDaContagem(endpoint: string, c: Contagem): string {
  const campos = new URLSearchParams({ p: semQuery(c.caminho) || '/' })
  const r = c.evento ? undefined : referenciaSemQuery(c.referencia)
  if (r) campos.set('r', r)
  if (c.evento) campos.set('e', 'true')
  campos.set('s', String(c.largura))
  if (c.robo) campos.set('b', String(c.robo))
  campos.set('rnd', c.rnd)
  return `${endpoint}?${campos}`
}

/** Manda uma contagem. `no-cors` e sem cookie: a resposta não importa. */
export function enviar(
  endpoint: string,
  contagem: Omit<Contagem, 'largura' | 'robo' | 'rnd'>,
) {
  const url = urlDaContagem(endpoint, {
    ...contagem,
    largura: window.screen.width,
    robo: navigator.webdriver ? 153 : 0,
    rnd: Math.random().toString(36).slice(2, 7),
  })
  void fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    credentials: 'omit',
    keepalive: true,
  }).catch(() => {})
}
