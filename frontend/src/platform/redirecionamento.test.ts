import { describe, expect, test } from 'vitest'
import { comRedirecionamentos } from './redirecionamento'

const MAPA = { '/estudos/silva-2020': '/estudos/silva-2020-apps-brasil' }

function montar() {
  const chegaram: string[] = []
  const fetch = comRedirecionamentos(MAPA, async (request: Request) => {
    chegaram.push(new URL(request.url).pathname)
    return new Response('página')
  })
  return { fetch, chegaram }
}

describe('os 301 do servidor', () => {
  test('caminho com barra final vai para o sem barra, com a query junto', async () => {
    const { fetch, chegaram } = montar()
    const resposta = await fetch(new Request('https://temestudo.com/estudos/?v=1&g=h'))
    expect(resposta.status).toBe(301)
    expect(resposta.headers.get('location')).toBe('/estudos?v=1&g=h')
    expect(chegaram).toEqual([])
  })

  test('caminho do `antes` vai para o de hoje', async () => {
    const { fetch } = montar()
    const resposta = await fetch(new Request('https://temestudo.com/estudos/silva-2020'))
    expect(resposta.status).toBe(301)
    expect(resposta.headers.get('location')).toBe('/estudos/silva-2020-apps-brasil')
  })

  test('caminho antigo com barra final vai direto ao de hoje', async () => {
    const { fetch } = montar()
    const resposta = await fetch(new Request('https://temestudo.com/estudos/silva-2020/?x=1'))
    expect(resposta.headers.get('location')).toBe('/estudos/silva-2020-apps-brasil?x=1')
  })

  test('barras repetidas no começo não viram link para outro domínio', async () => {
    const { fetch } = montar()
    const resposta = await fetch(new Request('https://temestudo.com//outro.com/'))
    expect(resposta.status).toBe(301)
    expect(resposta.headers.get('location')).toBe('/outro.com')
  })

  test('o início e os caminhos certos seguem para o app', async () => {
    const { fetch, chegaram } = montar()
    for (const url of ['https://temestudo.com/', 'https://temestudo.com/estudos?v=1']) {
      expect((await fetch(new Request(url))).status).toBe(200)
    }
    expect(chegaram).toEqual(['/', '/estudos'])
  })
})
