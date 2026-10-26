import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  buildLibrary,
  readFiles,
  topicReadings,
  type LoadResult,
} from './index.ts'

const valid = readFiles(
  fileURLToPath(new URL('../fixtures/valid', import.meta.url)),
)

const SITES = `
sites:
  - id: daqui
    name: Site daqui
    home: https://daqui.example/
    language: pt
  - id: de-fora
    name: Site de fora
    home: https://fora.example/
    language: en
    notices:
      cause: Defende uma causa.
`

const reading = (fields: string) => `
  - site: de-fora
    title: Uma página
    url: https://fora.example/uma
    description: Uma linha para o leitor.
    topics: [onde-conhecer]
${fields}`

/** The fixture library with `data/neighbor-sites.yaml`. */
const withFile = (text: string): LoadResult =>
  buildLibrary([...valid, { path: 'data/neighbor-sites.yaml', text }])

function errorsOf(result: LoadResult): string[] {
  if (result.ok) throw new Error('the library should have failed')
  return result.errors.map((e) => e.message)
}

describe('the Neighbor sites file', () => {
  it('without the file, the library has no sites and no Readings', () => {
    const result = buildLibrary(valid)
    expect(result.ok && result.library.readings).toEqual([])
  })

  it('reads the sites and their Readings, Portuguese first in each Topic', () => {
    const result = withFile(`${SITES}
readings:${reading('')}
  - site: daqui
    title: Outra página
    url: https://daqui.example/outra
    description: Outra linha.
    topics: [onde-conhecer]
    notices:
      commercial: A autora vende um curso.
`)
    if (!result.ok) throw new Error(result.errors[0]?.message)
    expect(result.library.neighborSites.map((s) => s.id)).toEqual([
      'daqui',
      'de-fora',
    ])
    expect(
      topicReadings(result.library, 'onde-conhecer').map((r) => r.url),
    ).toEqual(['https://daqui.example/outra', 'https://fora.example/uma'])
    expect(topicReadings(result.library, 'outro-tema')).toEqual([])
  })

  it('rejects the same page twice, even with http, www or a trailing slash; another query is another page', () => {
    const again = (url: string) =>
      reading('').replace('https://fora.example/uma', url)
    expect(
      errorsOf(
        withFile(
          `${SITES}\nreadings:${reading('')}${again('http://www.fora.example/uma/')}${again('https://fora.example/uma?p=2')}`,
        ),
      ),
    ).toEqual([
      'data/neighbor-sites.yaml: readings.1.url: the URL http://www.fora.example/uma/ is already Reading 0',
    ])
  })

  it('rejects a Reading without its line for the reader', () => {
    const missing = reading('').replace(
      '    description: Uma linha para o leitor.\n',
      '',
    )
    expect(errorsOf(withFile(`${SITES}\nreadings:${missing}`))).toEqual([
      'data/neighbor-sites.yaml: readings.0.description: required field missing',
    ])
  })

  it('rejects a Topic that does not exist and a site that is not listed', () => {
    const wrong = reading('')
      .replace('[onde-conhecer]', '[onde-conhecer, tema-inventado]')
      .replace('site: de-fora', 'site: sumido')
    expect(errorsOf(withFile(`${SITES}\nreadings:${wrong}`))).toEqual([
      'data/neighbor-sites.yaml: readings.0.site: the site sumido is not in sites',
      'data/neighbor-sites.yaml: readings.0.topics.1: the Topic tema-inventado does not exist (guides/tema-inventado.md)',
    ])
  })

  it('rejects a Reading with no Topic, a site listed twice and an unknown notice', () => {
    const empty = reading('    notices:\n      rating: cinco estrelas').replace(
      '[onde-conhecer]',
      '[]',
    )
    const twice = `${SITES}  - id: daqui\n    name: De novo\n    home: https://daqui.example/\n    language: pt\n`
    expect(errorsOf(withFile(`${twice}\nreadings:${empty}`))).toEqual([
      'data/neighbor-sites.yaml: readings.0.topics: name at least one Topic (got [])',
      'data/neighbor-sites.yaml: readings.0.notices.rating: unknown field',
    ])
    expect(errorsOf(withFile(`${twice}\nreadings:${reading('')}`))).toEqual([
      'data/neighbor-sites.yaml: sites.2.id: the site daqui is listed twice',
    ])
  })

  it('takes a Caveat on a Reading and refuses one on a site', () => {
    const caveat = '    notices:\n      caveat: O estudo achou menos.'
    const result = withFile(`${SITES}\nreadings:${reading(caveat)}`)
    expect(result.ok && result.library.readings[0]?.notices).toEqual({
      caveat: 'O estudo achou menos.',
    })
    const onSite = SITES.replace(
      'cause: Defende uma causa.',
      'caveat: O estudo achou menos.',
    )
    expect(errorsOf(withFile(`${onSite}\nreadings:${reading('')}`))).toEqual([
      'data/neighbor-sites.yaml: sites.1.notices.caveat: unknown field',
    ])
  })
})
