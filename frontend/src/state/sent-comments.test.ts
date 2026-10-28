import { beforeEach, expect, test, vi } from 'vite-plus/test'
import {
  addSentComment,
  editSentComment,
  markCommentsFound,
  readSentComments,
  removeSentComment,
  validateSentComments,
  updateCommentStatuses,
  markCommentStatusesSeen,
  type NewSentComment,
} from './sent-comments'

const KEY = 'tem-estudo:sent-comments'

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

const sent = (
  exact: string,
  path = '/onde-conhecer-pessoas',
  issue = 41,
): NewSentComment => ({
  path,
  pageTitle: 'Onde conhecer pessoas',
  link: `${path}#:~:text=${encodeURIComponent(exact)}`,
  text: exact,
  exact,
  prefix: 'antes ',
  suffix: ' depois',
  kind: 'wrong',
  comment: 'O número não bate.',
  issue,
})

const stored = () => JSON.parse(items.get(KEY) ?? 'null') as unknown

test('old records default to received; a changed status stays unread until seen', () => {
  const made = addSentComment(sent('fica perto'))
  updateCommentStatuses([{ issue: made.issue, status: 'corrected' }])
  expect(readSentComments()[0]).toMatchObject({
    status: 'corrected',
    seenStatus: 'received',
  })
  markCommentStatusesSeen([made.id])
  expect(readSentComments()[0]).toMatchObject({
    status: 'corrected',
    seenStatus: 'corrected',
  })
})

test('a sent Comentário is kept with its quote, link, type, text, date and issue number', () => {
  vi.setSystemTime(new Date('2026-10-28T12:00:00Z'))
  const made = addSentComment(sent('fica perto'))
  vi.useRealTimers()

  expect(made).toMatchObject({
    ...sent('fica perto'),
    changed: false,
    at: Date.parse('2026-10-28T12:00:00Z'),
  })
  expect(made.id).not.toBe('')
  expect(stored()).toEqual([made])
  expect(readSentComments()).toEqual([made])
})

test('two Comentários on the same quote are two entries: each is its own issue', () => {
  addSentComment(sent('fica perto', undefined, 41))
  addSentComment(sent('fica perto', undefined, 42))
  expect(readSentComments().map((c) => c.issue)).toEqual([41, 42])
})

test('what the storage holds is read entry by entry: one that does not hold up is dropped alone', () => {
  const good = { ...sent('fica perto'), id: 'a', changed: true, at: 1 }
  expect(
    validateSentComments([
      good,
      { ...good, id: 'b', exact: '' },
      { ...good, id: 'c', kind: 'spam' },
      { ...good, id: 'd', issue: 0 },
      { ...good, id: 'e', issue: 4.5 },
      { ...good, id: 'f', at: 'ontem' },
      { ...good, id: 'a' },
      'junk',
    ]),
  ).toEqual([good])
  expect(validateSentComments({ not: 'a list' })).toBeNull()
  expect(validateSentComments([{ ...good, changed: 'yes' }])).toEqual([
    { ...good, changed: false },
  ])
})

test('"Tirar da lista" forgets the entry on this device, and the last one empties the key', () => {
  const a = addSentComment(sent('fica perto'))
  const b = addSentComment(sent('online'))
  removeSentComment(a.id)
  expect(readSentComments()).toEqual([b])
  removeSentComment(b.id)
  expect(items.has(KEY)).toBe(false)
  expect(readSentComments()).toEqual([])
})

test('after its page looked for the quotes, the missing ones are marked changed, and only that page’s', () => {
  const here = addSentComment(sent('fica perto'))
  const gone = addSentComment(sent('uma frase que saiu'))
  const elsewhere = addSentComment(sent('complemento', '/dicas/apps'))

  markCommentsFound('/onde-conhecer-pessoas', new Set([here.id]))
  expect(readSentComments().map((c) => [c.id, c.changed])).toEqual([
    [here.id, false],
    [gone.id, true],
    [elsewhere.id, false],
  ])

  const before = writes
  markCommentsFound('/onde-conhecer-pessoas', new Set([here.id]))
  expect(writes).toBe(before)

  markCommentsFound('/onde-conhecer-pessoas', new Set([here.id, gone.id]))
  expect(readSentComments().find((c) => c.id === gone.id)!.changed).toBe(false)
})

const KEY_A = 'a'.repeat(43)

type Edit = Parameters<typeof editSentComment>[2]

test('the edit key is kept with the Comentário; a record without one, or with a broken one, stays and cannot be edited', async () => {
  addSentComment({ ...sent('fica perto'), editKey: KEY_A })
  expect(readSentComments()[0]!.editKey).toBe(KEY_A)

  const old = { ...sent('online'), id: 'old', changed: false, at: 1 }
  expect(
    validateSentComments([old, { ...old, id: 'bad', editKey: 'x' }]),
  ).toEqual([old, { ...old, id: 'bad' }])

  const edit = vi.fn<Edit>(async () => ({ edit: 'edited' }))
  const plain = addSentComment(sent('sem chave'))
  expect(
    await editSentComment(plain.id, { kind: 'other', comment: 'novo' }, edit),
  ).toBe('failed')
  expect(edit).not.toHaveBeenCalled()
})

test('an edit the server took gives the entry the new type and text; a closed or failed one leaves it', async () => {
  const made = addSentComment({ ...sent('fica perto'), editKey: KEY_A })
  const edit = vi.fn<Edit>(async () => ({ edit: 'edited' }))

  expect(
    await editSentComment(
      made.id,
      { kind: 'unclear', comment: ' novo ' },
      edit,
    ),
  ).toBe('edited')
  expect(edit).toHaveBeenCalledWith({
    issue: 41,
    key: KEY_A,
    kind: 'unclear',
    text: ' novo ',
  })
  expect(readSentComments()[0]).toMatchObject({
    kind: 'unclear',
    comment: 'novo',
    editKey: KEY_A,
    issue: 41,
  })

  for (const reply of ['closed', 'failed'] as const) {
    expect(
      await editSentComment(
        made.id,
        { kind: 'other', comment: 'outro' },
        async () => ({ edit: reply }),
      ),
    ).toBe(reply)
  }
  expect(
    await editSentComment(made.id, { kind: 'other', comment: 'outro' }, () =>
      Promise.reject(new TypeError('offline')),
    ),
  ).toBe('failed')
  expect(readSentComments()[0]).toMatchObject({
    kind: 'unclear',
    comment: 'novo',
  })
})
