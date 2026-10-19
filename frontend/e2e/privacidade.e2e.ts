import { expect, test } from '@playwright/test'

// ADR 0001: a query do link leva o Perfil, e não pode vazar para um Estudo
// externo pelo Referer.
test('a página aberta por um link com query sai com Referrer-Policy: strict-origin', async ({
  request,
}) => {
  const resposta = await request.get('/?v=1&g=h&p=m&i=30')
  expect(resposta.status()).toBe(200)
  expect(resposta.headers()['referrer-policy']).toBe('strict-origin')
})
