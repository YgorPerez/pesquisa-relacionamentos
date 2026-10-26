// The Possible group link preview over the fixture data: the fixture's
// "Brazil" is only Acre (`e2e/library/dados`).
import { resolve } from 'node:path'
import { openPack } from '@tem-estudo/rules/possible-group-data'
import { linkQuery } from '@tem-estudo/rules/link'
import { DEFAULT_REQUIREMENTS } from '@tem-estudo/rules/requirements'
import { describe, expect, it } from 'vite-plus/test'
import { buildPacks } from '../../vite/possible-group.ts'
import { buildGroupPreview } from './group-preview'

const built = buildPacks(
  resolve(import.meta.dirname, '../../e2e/library/data/possible-group'),
)
const data = {
  places: [...built.packs.keys()],
  example: built.example,
}
const pack = async (place: string, detail: boolean) => {
  const text = (detail ? built.detailPacks : built.packs).get(place as never)
  return text ? openPack(JSON.parse(text)) : null
}
const PROFILE = { gender: 'mulher', seeks: 'homens', age: 28 } as const

const preview = (query: string, from = pack) =>
  buildGroupPreview(query, data, from)

describe('buildGroupPreview', () => {
  it('without the link query, there is no preview', async () => {
    expect(await preview('')).toBeNull()
    expect(await preview('utm_source=zap')).toBeNull()
  })

  it('the link with nothing said carries the example count, without downloading a pack', async () => {
    const none = async () => {
      throw new Error('should not request a pack')
    }
    const nothingSaid = linkQuery({
      calculator: 'grupo-possivel',
      profile: null,
      requirements: null,
    })
    expect((await preview(nothingSaid, none))?.title).toMatch(/^Entre .+ e /)
  })

  it('the municipality goes into the title', async () => {
    const query = linkQuery({
      calculator: 'grupo-possivel',
      profile: PROFILE,
      requirements: {
        ...DEFAULT_REQUIREMENTS,
        place: { state: 'AC', municipality: '1200401' },
      },
    })
    expect((await preview(query))?.title).toContain('Rio Branco (AC)')
  })

  it('a municipality the data does not have counts as the whole state', async () => {
    const query = linkQuery({
      calculator: 'grupo-possivel',
      profile: PROFILE,
      requirements: {
        ...DEFAULT_REQUIREMENTS,
        place: { state: 'AC', municipality: '9999999' },
      },
    })
    expect((await preview(query))?.title).toMatch(/ em AC, /)
  })

  it("without Brazil's pack, there is no preview", async () => {
    const query = linkQuery({
      calculator: 'grupo-possivel',
      profile: PROFILE,
      requirements: null,
    })
    expect(await preview(query, async () => null)).toBeNull()
  })
})

describe('buildGroupPreview with a detail Requirement (parents, work, home)', () => {
  it('a link with "tem casa própria" counts over the detail packs and says it', async () => {
    const query = linkQuery({
      calculator: 'grupo-possivel',
      profile: PROFILE,
      requirements: {
        ...DEFAULT_REQUIREMENTS,
        place: { state: 'AC' },
        ownsHome: true,
      },
    })
    const result = await preview(query)
    expect(result?.title).toMatch(/^Entre .+ e .+ homens em AC/)
    expect(result?.description).toContain('tem casa própria')
  })
})
