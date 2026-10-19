import { describe, expect, it } from 'vite-plus/test'
import { conferirNoAr } from './conferir-no-ar.ts'

const HTML = 'text/html;charset=utf-8'
const JS = 'text/javascript; charset=utf-8'
const CSS = 'text/css; charset=utf-8'

/** A página como o TanStack Start a desenha: o CSS num `<link>`, o JS num
 * `modulepreload` e no `import()` do script inline, e o NUL do `__root__`. */
const PAGINA = `<!DOCTYPE html><html><head>
<link rel="stylesheet" href="/assets/estilo-B3x_9a.css"/>
<link rel="modulepreload" href="/assets/main-Df81kZ.js"/>
</head><body><script>"__root__\0"</script>
<script type="module">import("/assets/main-Df81kZ.js")</script></body></html>`

type Resposta = {
  status?: number
  tipo?: string
  corpo?: string
  cabecalhos?: Record<string, string>
}

/** Um `fetch` que responde pelo caminho (com a query) e guarda o que pediram. */
function site(respostas: Record<string, Resposta>) {
  const pedidos: string[] = []
  const buscar = async (url: string) => {
    const { pathname, search, protocol } = new URL(url)
    const prefixo = protocol === 'http:' ? 'http ' : ''
    pedidos.push(`${prefixo}${pathname}${search}`)
    const r = respostas[`${prefixo}${pathname}`]
    if (!r) return new Response('não achei', { status: 404 })
    return new Response(r.corpo ?? '', {
      status: r.status ?? 200,
      headers: { 'content-type': r.tipo ?? HTML, ...r.cabecalhos },
    })
  }
  return { buscar, pedidos }
}

const NO_AR: Record<string, Resposta> = {
  '/': {
    corpo: PAGINA,
    cabecalhos: { 'referrer-policy': 'strict-origin' },
  },
  '/assets/main-Df81kZ.js': { tipo: JS, corpo: 'export {}' },
  '/assets/estilo-B3x_9a.css': { tipo: CSS, corpo: 'body{}' },
  'http /': {
    status: 301,
    cabecalhos: { location: 'https://temestudo.com/?x=1' },
  },
}

/** Sem esperar de verdade: o relógio anda o que o intervalo pede. */
function semEspera() {
  let agora = 0
  return {
    agora: () => agora,
    esperar: async (ms: number) => {
      agora += ms
    },
  }
}

const conferir = (respostas: Record<string, Resposta>) =>
  conferirNoAr({
    host: 'temestudo.com',
    marca: 'abc1234',
    buscar: site(respostas).buscar,
    prazoMs: 10_000,
    intervaloMs: 5_000,
    ...semEspera(),
  })

describe('conferirNoAr', () => {
  it('passa quando a página, os assets dela e o https estão certos', async () => {
    const { buscar, pedidos } = site(NO_AR)

    const r = await conferirNoAr({
      host: 'temestudo.com',
      marca: 'abc1234',
      buscar,
      ...semEspera(),
    })

    expect(r).toEqual({
      ok: true,
      linhas: [
        'temestudo.com: / chega com Referrer-Policy: strict-origin',
        'temestudo.com: /assets/estilo-B3x_9a.css chega como text/css; charset=utf-8',
        'temestudo.com: /assets/main-Df81kZ.js chega como text/javascript; charset=utf-8',
        'temestudo.com: http://temestudo.com/?x=1 leva a https://temestudo.com/?x=1',
      ],
    })
    // A query fura o cache de quem estiver no meio.
    expect(pedidos[0]).toBe('/?conferencia=abc1234')
    // O mesmo asset citado duas vezes é pedido uma vez.
    expect(pedidos.filter((p) => p.endsWith('.js'))).toHaveLength(1)
  })

  it('falha se um asset vier como HTML', async () => {
    const r = await conferir({
      ...NO_AR,
      '/assets/main-Df81kZ.js': { corpo: '<!DOCTYPE html>', tipo: HTML },
    })

    expect(r).toEqual({
      ok: false,
      motivo:
        'temestudo.com: /assets/main-Df81kZ.js chegou com 200 e text/html;charset=utf-8 (3 tentativas em 10 s)',
    })
  })

  it('falha se o CSS vier com outro tipo', async () => {
    const r = await conferir({
      ...NO_AR,
      '/assets/estilo-B3x_9a.css': { tipo: 'text/plain' },
    })

    expect(r.ok).toBe(false)
    expect(!r.ok && r.motivo).toContain(
      '/assets/estilo-B3x_9a.css chegou com 200 e text/plain',
    )
  })

  it('falha se um asset citado sumiu', async () => {
    const { '/assets/estilo-B3x_9a.css': _, ...semOCss } = NO_AR

    const r = await conferir(semOCss)

    expect(!r.ok && r.motivo).toContain(
      '/assets/estilo-B3x_9a.css chegou com 404',
    )
  })

  it('falha se a página não cita nenhum JavaScript', async () => {
    const r = await conferir({
      ...NO_AR,
      '/': { ...NO_AR['/'], corpo: '<html>Domínio estacionado</html>' },
    })

    expect(!r.ok && r.motivo).toContain(
      'o HTML de / não cita um /assets/*.js: <html>Domínio estacionado</html>',
    )
  })

  it('falha sem o Referrer-Policy: strict-origin', async () => {
    const r = await conferir({ ...NO_AR, '/': { corpo: PAGINA } })

    expect(!r.ok && r.motivo).toContain(
      '/ não manda Referrer-Policy: strict-origin (veio nenhum)',
    )
  })

  it('falha se o http não leva ao https com a query', async () => {
    const r = await conferir({
      ...NO_AR,
      'http /': {
        status: 301,
        cabecalhos: { location: 'https://temestudo.com/' },
      },
    })

    expect(!r.ok && r.motivo).toContain(
      'http://temestudo.com/?x=1 leva a https://temestudo.com/, não a https://temestudo.com/?x=1',
    )
  })

  it('tenta de novo enquanto o app sobe', async () => {
    let vezes = 0
    const { buscar } = site(NO_AR)
    const r = await conferirNoAr({
      host: 'temestudo.com',
      marca: 'abc1234',
      buscar: async (url) => {
        if (vezes++ === 0) throw new Error('conexão recusada')
        return buscar(url)
      },
      ...semEspera(),
    })

    expect(r.ok).toBe(true)
  })

  it('a conexão que não abre vira o motivo', async () => {
    const r = await conferirNoAr({
      host: 'temestudo.com',
      marca: 'abc1234',
      buscar: async () => {
        throw new TypeError('fetch failed', { cause: 'ECONNREFUSED' })
      },
      prazoMs: 0,
      ...semEspera(),
    })

    expect(r).toEqual({
      ok: false,
      motivo:
        'temestudo.com: a conexão falhou: ECONNREFUSED (1 tentativas em 0 s)',
    })
  })
})
