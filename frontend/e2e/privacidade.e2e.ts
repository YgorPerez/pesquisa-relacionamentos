import { expect, test } from '@playwright/test'
import { linkQuery } from '@tem-estudo/rules/link'

// ADR 0001: a query do link leva o Perfil, e não pode vazar para um Estudo
// externo pelo Referer. A query sai do codec de verdade, para o teste não
// passar com chaves que o site nem lê.
test('a página aberta por um link com query sai com Referrer-Policy: strict-origin', async ({
  request,
}) => {
  const query = linkQuery({
    calculator: 'grupo-possivel',
    profile: { genero: 'homem', procura: 'mulheres', idade: 30 },
    requirements: null,
  })
  expect(query).toBe('v=1&genero=homem&procura=mulheres&idade=30')
  const resposta = await request.get(`/grupo-possivel?${query}`)
  expect(resposta.status()).toBe(200)
  expect(resposta.headers()['referrer-policy']).toBe('strict-origin')
})
