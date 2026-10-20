import { expect, test } from '@playwright/test'
import { linkQuery } from '@tem-estudo/rules/link'

// ADR 0001: the link query carries the Profile, and must not leak to an
// external Study through the Referer. The query comes from the real codec, so
// the test does not pass with keys the site does not even read.
test('a page opened by a link with a query goes out with Referrer-Policy: strict-origin', async ({
  request,
}) => {
  const query = linkQuery({
    calculator: 'grupo-possivel',
    profile: { gender: 'homem', seeks: 'mulheres', age: 30 },
    requirements: null,
  })
  expect(query).toBe('v=1&genero=homem&procura=mulheres&idade=30')
  const response = await request.get(`/grupo-possivel?${query}`)
  expect(response.status()).toBe(200)
  expect(response.headers()['referrer-policy']).toBe('strict-origin')
})
