import { describe, expect, test } from 'vite-plus/test'
import { hitUrl } from './goatcounter'
import { browserAsksNotToCount } from './counting'

const ENDPOINT = 'https://stats.temestudo.cloud/count'
const fields = (url: string): Record<string, string> => {
  const u = new URL(url)
  return {
    address: `${u.origin}${u.pathname}`,
    ...Object.fromEntries(u.searchParams),
  }
}

describe('hitUrl', () => {
  test('the visit carries the path, the referrer without query and the screen width', () => {
    const url = hitUrl(ENDPOINT, {
      path: '/grupo-possivel',
      referrer: 'https://www.google.com/search?q=quantas+mulheres',
      width: 412,
      bot: 0,
      rnd: 'abcde',
    })
    expect(fields(url)).toEqual({
      address: ENDPOINT,
      p: '/grupo-possivel',
      r: 'https://www.google.com/search',
      s: '412',
      rnd: 'abcde',
    })
  })

  test('the path loses the query and the fragment, if they come', () => {
    const url = hitUrl(ENDPOINT, {
      path: '/?v=1&g=h#perfil',
      width: 390,
      bot: 0,
      rnd: 'x',
    })
    expect(fields(url).p).toBe('/')
  })

  test('the event goes with e=true, without referrer', () => {
    const url = hitUrl(ENDPOINT, {
      path: 'helped/yes/app-ou-presencial',
      event: true,
      referrer: 'https://exemplo.com/',
      width: 1280,
      bot: 153,
      rnd: 'y',
    })
    expect(fields(url)).toEqual({
      address: ENDPOINT,
      p: 'helped/yes/app-ou-presencial',
      e: 'true',
      s: '1280',
      b: '153',
      rnd: 'y',
    })
  })

  test('a referrer that is not an address stays out', () => {
    const url = hitUrl(ENDPOINT, {
      path: '/',
      referrer: 'lixo',
      width: 1,
      bot: 0,
      rnd: 'z',
    })
    expect(fields(url).r).toBeUndefined()
  })
})

describe('browserAsksNotToCount', () => {
  test.each([
    [{}, false],
    [{ globalPrivacyControl: true }, true],
    [{ globalPrivacyControl: false }, false],
    [{ doNotTrack: '1' }, true],
    [{ doNotTrack: '0' }, false],
    [{ doNotTrack: 'unspecified' }, false],
    [{ doNotTrack: 'yes' }, true],
  ])('%j → %s', (browser, expected) => {
    expect(browserAsksNotToCount(browser)).toBe(expected)
  })
})
