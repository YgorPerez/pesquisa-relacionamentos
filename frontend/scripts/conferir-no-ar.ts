// O que o deploy confere de fora, pela internet, depois de pôr o app no ar
// (ADR 0008), no molde do Festival dos Macacos (`conferir-no-ar.ts` de lá):
// a página `/` chega com o `Referrer-Policy: strict-origin`, cada
// `/assets/*.js` e `/assets/*.css` que ela cita chega com o tipo dele, e não
// como uma página de erro em HTML, e o http leva ao https com a query junto.
// O `deploy.yml` o chama assim:
//
//   node scripts/conferir-no-ar.ts temestudo.cloud <sha>
//
// A página do TanStack traz um byte NUL (o id `"__root__\0"` da rota raiz
// desidratada), e o `grep` a lê como binária: aqui a busca é no texto.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { cronometro } from './cronometro.ts'

type Buscar = (url: string, init?: RequestInit) => Promise<Response>

export type OpcoesDaConferencia = {
  host: string
  /** Vai na query da página, para furar o cache de quem estiver no meio. */
  marca: string
  buscar?: Buscar
  /** Quanto, no total, tentar enquanto o app sobe. */
  prazoMs?: number
  /** Quanto esperar entre duas tentativas. */
  intervaloMs?: number
  esperar?: (ms: number) => Promise<void>
  agora?: () => number
}

export type Conferencia =
  | { ok: true; linhas: string[] }
  | { ok: false; motivo: string }

const ASSET = /\/assets\/[A-Za-z0-9._-]+\.(?:js|css)/g

/** O tipo que cada extensão de asset tem que trazer. */
const TIPO_DO_ASSET = { js: /javascript/i, css: /^text\/css\b/i } as const

/** O começo do que veio, numa linha, para a mensagem de erro. */
function trecho(texto: string) {
  const linha = texto.replace(/\s+/g, ' ').trim()
  return linha.length > 200 ? `${linha.slice(0, 200)}…` : linha
}

class Falha extends Error {}

const SEM_CACHE = {
  cache: 'no-store',
  headers: { 'cache-control': 'no-cache' },
} as const

/** Uma tentativa: as linhas do que passou, ou uma `Falha` com o que deu
 * errado e o que veio. */
async function conferirUmaVez(buscar: Buscar, host: string, marca: string) {
  const base = `https://${host}/`
  const linhas: string[] = []

  const pagina = await buscar(`${base}?conferencia=${marca}`, {
    ...SEM_CACHE,
    signal: AbortSignal.timeout(15_000),
  })
  const html = await pagina.text()
  if (pagina.status !== 200) throw new Falha(`/ respondeu ${pagina.status}`)
  const politica = pagina.headers.get('referrer-policy')
  if (politica !== 'strict-origin')
    throw new Falha(
      `/ não manda Referrer-Policy: strict-origin (veio ${politica ?? 'nenhum'})`,
    )
  linhas.push(`${host}: / chega com Referrer-Policy: strict-origin`)

  const assets = [...new Set(html.match(ASSET))]
  if (!assets.some((a) => a.endsWith('.js')))
    throw new Falha(`o HTML de / não cita um /assets/*.js: ${trecho(html)}`)
  // Todos juntos; a primeira falha, na ordem da página, é o motivo.
  const chegadas = await Promise.all(
    assets.map(async (caminho) => {
      const resposta = await buscar(new URL(caminho, base).href, {
        ...SEM_CACHE,
        signal: AbortSignal.timeout(15_000),
      })
      await resposta.body?.cancel()
      const tipo = resposta.headers.get('content-type') ?? '(sem content-type)'
      const esperado = caminho.endsWith('.js')
        ? TIPO_DO_ASSET.js
        : TIPO_DO_ASSET.css
      const certo = resposta.status === 200 && esperado.test(tipo)
      return { caminho, tipo, certo, status: resposta.status }
    }),
  )
  for (const { caminho, tipo, certo, status } of chegadas) {
    if (!certo) throw new Falha(`${caminho} chegou com ${status} e ${tipo}`)
    linhas.push(`${host}: ${caminho} chega como ${tipo}`)
  }

  const http = `http://${host}/?x=1`
  const https = `https://${host}/?x=1`
  const redirecao = await buscar(http, {
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000),
  })
  await redirecao.body?.cancel()
  const destino = redirecao.headers.get('location')
  if (destino !== https)
    throw new Falha(`${http} leva a ${destino ?? 'nada'}, não a ${https}`)
  linhas.push(`${host}: ${http} leva a ${https}`)

  return linhas
}

/** Confere o host, tentando de novo a cada `intervaloMs` até o `prazoMs`: o
 * contêiner acabou de trocar, e a primeira conexão pode cair. */
export async function conferirNoAr({
  host,
  marca,
  buscar = fetch,
  prazoMs = 60_000,
  intervaloMs = 5_000,
  esperar = (ms) => new Promise((pronto) => setTimeout(pronto, ms)),
  agora = Date.now,
}: OpcoesDaConferencia): Promise<Conferencia> {
  const limite = agora() + prazoMs
  let tentativas = 0
  for (;;) {
    tentativas++
    try {
      return { ok: true, linhas: await conferirUmaVez(buscar, host, marca) }
    } catch (erro) {
      const motivo =
        erro instanceof Falha
          ? erro.message
          : `a conexão falhou: ${String((erro as Error)?.cause ?? erro)}`
      if (agora() + intervaloMs > limite)
        return {
          ok: false,
          motivo: `${host}: ${motivo} (${tentativas} tentativas em ${Math.round(prazoMs / 1000)} s)`,
        }
      await esperar(intervaloMs)
    }
  }
}

if (import.meta.main) {
  const [host, marca] = process.argv.slice(2)
  if (!host || !marca) {
    console.error('[no ar] Uso: node scripts/conferir-no-ar.ts <host> <sha>')
    process.exit(1)
  }
  const dizer = (linha: string) => console.log(`[no ar] ${linha}`)
  const r = await cronometro(dizer).etapa('Conferência de fora', () =>
    conferirNoAr({ host, marca }),
  )
  if (r.ok) for (const linha of r.linhas) dizer(linha)
  else {
    console.error(`::error title=Site no ar::${r.motivo}`)
    process.exit(1)
  }
}
