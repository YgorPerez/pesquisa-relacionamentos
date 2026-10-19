import { describe, expect, test } from 'vite-plus/test'
import { comRegistro } from './registro-do-pedido'

// O link de compartilhamento leva o Perfil na query (ADR 0001). O log do app
// guarda só método, caminho, status e tempo.
const LINK = 'https://temestudo.com/grupo-possivel?v=1&g=h&p=m&i=30&f=25-35'

function montar(resposta: () => Response | Promise<Response>) {
  const linhas: string[] = []
  let relogio = 1000
  const fetch = comRegistro(async () => resposta(), {
    escrever: (linha) => linhas.push(linha),
    agora: () => (relogio += 12),
  })
  return { fetch, linhas }
}

describe('o registro de cada pedido no servidor', () => {
  test('uma requisição com query deixa na linha de log só método, caminho, status e tempo', async () => {
    const { fetch, linhas } = montar(() => new Response('ok', { status: 200 }))

    await fetch(new Request(LINK))

    expect(linhas).toEqual(['GET /grupo-possivel 200 12ms'])
  })

  test('nenhum pedaço da query chega ao log, nem codificado', async () => {
    const { fetch, linhas } = montar(() => new Response(null, { status: 302 }))

    await fetch(
      new Request('https://temestudo.com/?g=mulher%20trans&o=bi#topo', {
        method: 'HEAD',
      }),
    )

    expect(linhas).toEqual(['HEAD / 302 12ms'])
    expect(linhas.join('\n')).not.toMatch(/[?&=#%]|mulher|trans|bi/)
  })

  test('toda resposta sai com Referrer-Policy: strict-origin', async () => {
    const { fetch } = montar(
      () => new Response('ok', { headers: { 'content-type': 'text/html' } }),
    )

    const resposta = await fetch(new Request(LINK))

    expect(resposta.headers.get('referrer-policy')).toBe('strict-origin')
    expect(resposta.headers.get('content-type')).toBe('text/html')
    expect(await resposta.text()).toBe('ok')
  })

  test('um redirecionamento, que tem os cabeçalhos imutáveis, também leva o cabeçalho', async () => {
    const { fetch } = montar(() =>
      Response.redirect('https://temestudo.com/', 301),
    )

    const resposta = await fetch(new Request(LINK))

    expect(resposta.status).toBe(301)
    expect(resposta.headers.get('location')).toBe('https://temestudo.com/')
    expect(resposta.headers.get('referrer-policy')).toBe('strict-origin')
  })

  test('o pedido que estoura no servidor vira linha com status 500, sem a query', async () => {
    const { fetch, linhas } = montar(() => {
      throw new Error('quebrou')
    })

    await expect(fetch(new Request(LINK))).rejects.toThrow('quebrou')
    expect(linhas).toEqual(['GET /grupo-possivel 500 12ms'])
  })
})
