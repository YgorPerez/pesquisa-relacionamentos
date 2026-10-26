import { describe, expect, it } from 'vite-plus/test'
import type { Library } from '@tem-estudo/content'
import { readingGroups } from './neighbor-sites-view'

const topic = (slug: string, title: string) =>
  ({ slug, title }) as Library['topics'][number]

const LIBRARY = {
  topics: [
    topic('onde-conhecer-pessoas', 'Onde conhecer pessoas'),
    topic('escolher-parceiro', 'Escolher parceiro'),
    topic('manter-a-relacao', 'Manter a relação'),
  ],
  neighborSites: [
    {
      id: 'fora',
      name: 'Site de fora',
      home: 'https://fora.example/',
      language: 'en',
      notices: { cause: 'Defende o casamento.' },
    },
    {
      id: 'daqui',
      name: 'Site daqui',
      home: 'https://daqui.example/',
      language: 'pt',
    },
  ],
  readings: [
    {
      site: 'fora',
      title: 'Two topics',
      url: 'https://fora.example/a',
      description: 'Uma linha.',
      topics: ['manter-a-relacao', 'onde-conhecer-pessoas'],
      notices: { commercial: 'A autora vende um curso.' },
    },
    {
      site: 'daqui',
      title: 'Daqui',
      url: 'https://daqui.example/b',
      description: 'Outra linha.',
      topics: ['manter-a-relacao'],
    },
  ],
} satisfies Pick<Library, 'topics' | 'neighborSites' | 'readings'>

describe('readingGroups', () => {
  const groups = readingGroups(LIBRARY)

  it('one group per Topic with a Reading, in the Topics order; a Reading of two Topics is in both', () => {
    expect(
      groups.map((g) => [g.title, g.readings.map((r) => r.title)]),
    ).toEqual([
      ['Onde conhecer pessoas', ['Two topics']],
      ['Manter a relação', ['Daqui', 'Two topics']],
    ])
  })

  it("a Reading carries its site's name and language, and the site's notices before its own", () => {
    expect(groups[0]?.readings[0]).toEqual({
      url: 'https://fora.example/a',
      title: 'Two topics',
      description: 'Uma linha.',
      site: 'fora',
      siteName: 'Site de fora',
      language: 'en',
      notices: [
        { kind: 'cause', text: 'Defende o casamento.' },
        { kind: 'commercial', text: 'A autora vende um curso.' },
      ],
    })
  })
})
