import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vite-plus/test'
import {
  finishReading,
  forgetReading,
  inProgress,
  matchParagraph,
  readingPlace,
  saveReadingPlace,
  validateReading,
  type ReadingPlace,
} from './reading'

const KEY = 'tem-estudo:reading'

let items: Map<string, string>
beforeEach(() => {
  items = new Map()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (k: string) => items.get(k) ?? null,
      setItem: (k: string, v: string) => void items.set(k, v),
      removeItem: (k: string) => void items.delete(k),
    },
  })
})
afterEach(() => vi.unstubAllGlobals())

const place = (over: Partial<ReadingPlace> = {}): ReadingPlace => ({
  chapter: 'o-lugar-quase-nao-muda-a-relacao',
  chapterTitle: 'O lugar quase não muda a relação',
  chapterNumber: 2,
  chapters: 2,
  paragraph: { index: 0, text: 'A satisfação de quem se conheceu online' },
  progress: 0.6,
  at: 1_000,
  ...over,
})

const saved = () =>
  JSON.parse(items.get(KEY) ?? 'null') as {
    inProgress: object
    finished: string[]
  }

describe('the reading saved in the browser', () => {
  test('a Guide started shows in the list, the most recent first', () => {
    saveReadingPlace('onde-conhecer-pessoas', place({ at: 1_000 }))
    saveReadingPlace('escolher-parceiro', place({ at: 2_000 }))
    expect(inProgress(validateReading(saved())).map((i) => i.topic)).toEqual([
      'escolher-parceiro',
      'onde-conhecer-pessoas',
    ])
    expect(readingPlace('onde-conhecer-pessoas')).toEqual(place())
  })

  test('finishing a Guide takes it out of the list and keeps it as read, even if the reader goes on scrolling', () => {
    saveReadingPlace('onde-conhecer-pessoas', place())
    finishReading('onde-conhecer-pessoas')
    saveReadingPlace('onde-conhecer-pessoas', place({ at: 3_000 }))
    expect(saved()).toEqual({
      inProgress: {},
      finished: ['onde-conhecer-pessoas'],
    })
  })

  test('the × forgets only that Guide', () => {
    saveReadingPlace('onde-conhecer-pessoas', place())
    saveReadingPlace('escolher-parceiro', place())
    forgetReading('onde-conhecer-pessoas')
    expect(Object.keys(saved().inProgress)).toEqual(['escolher-parceiro'])
  })

  test('junk from another version is dropped entry by entry, and the rest opens', () => {
    const reading = validateReading({
      inProgress: {
        ok: place(),
        noChapter: { ...place(), chapter: '' },
        pastTheEnd: { ...place(), chapterNumber: 3 },
        overRead: { ...place(), progress: 1.5 },
        noParagraph: { ...place(), paragraph: 'x' },
      },
      finished: ['a', 'a', 3],
    })
    expect(Object.keys(reading!.inProgress)).toEqual(['ok', 'noParagraph'])
    expect(reading!.inProgress['noParagraph']!.paragraph).toBeNull()
    expect(reading!.finished).toEqual(['a'])
    expect(validateReading('reading')).toBeNull()
    expect(validateReading({})).toEqual({ inProgress: {}, finished: [] })
  })
})

describe('finding the paragraph again', () => {
  const texts = [
    'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto.',
    'Os estudos divergem sobre o lugar mudar a relação.',
    'Depende de quem você procura.',
  ]

  test('the same text, even moved to another place in the Chapter', () => {
    const mark = { index: 0, text: texts[1]! }
    expect(matchParagraph(mark, texts)).toBe(1)
  })

  test('a small edit still finds it', () => {
    const mark = {
      index: 0,
      text: 'A satisfação de quem se conheceu online e de quem se conheceu ao vivo fica perto.',
    }
    expect(matchParagraph(mark, texts)).toBe(0)
  })

  test('a paragraph that is gone finds nothing, and the Chapter start takes over', () => {
    const mark = { index: 1, text: 'Um parágrafo que saiu do texto inteiro.' }
    expect(matchParagraph(mark, texts)).toBeNull()
  })

  test('two equal paragraphs: the one closest to where it was', () => {
    const repeated = ['Veja a tabela.', 'Outro texto.', 'Veja a tabela.']
    expect(matchParagraph({ index: 2, text: 'Veja a tabela.' }, repeated)).toBe(
      2,
    )
  })
})
