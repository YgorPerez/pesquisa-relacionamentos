import { describe, expect, test } from 'vite-plus/test'
import { withRedirects } from './redirects'

const MAP = { '/estudos/silva-2020': '/estudos/silva-2020-apps-brasil' }

function setup() {
  const arrived: string[] = []
  const fetch = withRedirects(MAP, async (request: Request) => {
    arrived.push(new URL(request.url).pathname)
    return new Response('page')
  })
  return { fetch, arrived }
}

describe("the server's 301s", () => {
  test('a path with a trailing slash goes to the one without, with the query along', async () => {
    const { fetch, arrived } = setup()
    const response = await fetch(
      new Request('https://temestudo.cloud/estudos/?v=1&g=h'),
    )
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/estudos?v=1&g=h')
    expect(arrived).toEqual([])
  })

  test("a path from `antes` goes to today's", async () => {
    const { fetch } = setup()
    const response = await fetch(
      new Request('https://temestudo.cloud/estudos/silva-2020'),
    )
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      '/estudos/silva-2020-apps-brasil',
    )
  })

  test("an old path with a trailing slash goes straight to today's", async () => {
    const { fetch } = setup()
    const response = await fetch(
      new Request('https://temestudo.cloud/estudos/silva-2020/?x=1'),
    )
    expect(response.headers.get('location')).toBe(
      '/estudos/silva-2020-apps-brasil?x=1',
    )
  })

  test('repeated leading slashes do not become a link to another domain', async () => {
    const { fetch } = setup()
    const response = await fetch(
      new Request('https://temestudo.cloud//outro.com/'),
    )
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/outro.com')
  })

  test('the home page and the right paths go on to the app', async () => {
    const { fetch, arrived } = setup()
    for (const url of [
      'https://temestudo.cloud/',
      'https://temestudo.cloud/estudos?v=1',
    ]) {
      expect((await fetch(new Request(url))).status).toBe(200)
    }
    expect(arrived).toEqual(['/', '/estudos'])
  })
})
