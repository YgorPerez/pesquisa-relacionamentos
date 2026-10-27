import { beforeEach, expect, test, vi } from 'vite-plus/test'
import {
  addHighlight,
  markFound,
  readHighlights,
  removeHighlight,
  setNote,
  validateHighlights,
  type NewHighlight,
} from './highlights'

const KEY = 'tem-estudo:highlights'

let items: Map<string, string>
let writes: number
beforeEach(() => {
  items = new Map()
  writes = 0
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (k: string) => items.get(k) ?? null,
      setItem: (k: string, v: string) => {
        writes++
        items.set(k, v)
      },
      removeItem: (k: string) => {
        writes++
        items.delete(k)
      },
    },
  })
})

const made = (
  exact: string,
  path = '/onde-conhecer-pessoas',
): NewHighlight => ({
  path,
  pageTitle: 'Onde conhecer pessoas',
  link: `${path}#:~:text=${encodeURIComponent(exact)}`,
  text: exact,
  exact,
  prefix: 'antes ',
  suffix: ' depois',
})

test('what the storage holds is read Grifo by Grifo: one that does not hold up is dropped alone', () => {
  const good = {
    ...made('fica perto'),
    id: 'a',
    note: 'n',
    changed: true,
    at: 1,
  }
  expect(
    validateHighlights([
      good,
      { ...good, id: 'b', exact: '' },
      { ...good, id: 'c', at: 'ontem' },
      { ...good, id: 'a' },
      'junk',
      { ...good, id: 'd', note: 7, changed: 'sim' },
    ]),
  ).toEqual([good, { ...good, id: 'd', note: '', changed: false }])
  expect(validateHighlights({ items: [] })).toBeNull()
})

test('the same quote at the same place is one Grifo; another place is another', () => {
  const first = addHighlight(made('fica perto'))
  expect(addHighlight(made('fica perto'))).toEqual(first)
  addHighlight({ ...made('fica perto'), prefix: 'outro ' })
  expect(readHighlights()).toHaveLength(2)
  expect(first).toMatchObject({ note: '', changed: false })
})

test('a Nota is trimmed, and an empty one is no Nota; Tirar grifo forgets it all', () => {
  const { id } = addHighlight(made('fica perto'))
  setNote(id, '  ver o estudo  ')
  expect(readHighlights()[0]!.note).toBe('ver o estudo')
  setNote(id, '   ')
  expect(readHighlights()[0]!.note).toBe('')
  removeHighlight(id)
  expect(items.has(KEY)).toBe(false)
})

test('a page marks its Grifos found or changed, writing only when a mark moves, and leaves other pages alone', () => {
  const here = addHighlight(made('fica perto'))
  const gone = addHighlight(made('frase que saiu'))
  const elsewhere = addHighlight(made('como complemento', '/dicas/apps'))
  markFound('/onde-conhecer-pessoas', new Set([here.id]))
  expect(readHighlights().map((h) => [h.id, h.changed])).toEqual([
    [here.id, false],
    [gone.id, true],
    [elsewhere.id, false],
  ])
  const before = writes
  markFound('/onde-conhecer-pessoas', new Set([here.id]))
  expect(writes).toBe(before)
  // The text came back: the mark goes away.
  markFound('/onde-conhecer-pessoas', new Set([here.id, gone.id]))
  expect(readHighlights().find((h) => h.id === gone.id)!.changed).toBe(false)
})
