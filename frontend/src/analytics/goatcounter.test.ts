import { describe, expect, test } from 'vitest'
import { urlDaContagem } from './goatcounter'
import { navegadorPedeParaNaoContar } from './contagem'

const ENDPOINT = 'https://stats.temestudo.com/count'
const campos = (url: string): Record<string, string> => {
  const u = new URL(url)
  return { endereco: `${u.origin}${u.pathname}`, ...Object.fromEntries(u.searchParams) }
}

describe('urlDaContagem', () => {
  test('a visita leva o caminho, a referência sem query e a largura da tela', () => {
    const url = urlDaContagem(ENDPOINT, {
      caminho: '/grupo-possivel',
      referencia: 'https://www.google.com/search?q=quantas+mulheres',
      largura: 412,
      robo: 0,
      rnd: 'abcde',
    })
    expect(campos(url)).toEqual({
      endereco: ENDPOINT,
      p: '/grupo-possivel',
      r: 'https://www.google.com/search',
      s: '412',
      rnd: 'abcde',
    })
  })

  test('o caminho perde a query e o fragmento, se vierem', () => {
    const url = urlDaContagem(ENDPOINT, { caminho: '/?v=1&g=h#perfil', largura: 390, robo: 0, rnd: 'x' })
    expect(campos(url).p).toBe('/')
  })

  test('o evento vai com e=true, sem referência', () => {
    const url = urlDaContagem(ENDPOINT, {
      caminho: 'ajudou/sim/app-ou-presencial',
      evento: true,
      referencia: 'https://exemplo.com/',
      largura: 1280,
      robo: 153,
      rnd: 'y',
    })
    expect(campos(url)).toEqual({
      endereco: ENDPOINT,
      p: 'ajudou/sim/app-ou-presencial',
      e: 'true',
      s: '1280',
      b: '153',
      rnd: 'y',
    })
  })

  test('referência que não é endereço fica de fora', () => {
    const url = urlDaContagem(ENDPOINT, { caminho: '/', referencia: 'lixo', largura: 1, robo: 0, rnd: 'z' })
    expect(campos(url).r).toBeUndefined()
  })
})

describe('navegadorPedeParaNaoContar', () => {
  test.each([
    [{}, false],
    [{ globalPrivacyControl: true }, true],
    [{ globalPrivacyControl: false }, false],
    [{ doNotTrack: '1' }, true],
    [{ doNotTrack: '0' }, false],
    [{ doNotTrack: 'unspecified' }, false],
    [{ doNotTrack: 'yes' }, true],
  ])('%j → %s', (navegador, esperado) => {
    expect(navegadorPedeParaNaoContar(navegador)).toBe(esperado)
  })
})
