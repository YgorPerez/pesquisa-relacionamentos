import { beforeEach, expect, test, vi } from 'vite-plus/test'
import { addSentComment, readSentComments } from './sent-comments'
import { commentStatusVisit } from './comment-status'

beforeEach(() => {
  const items = new Map<string, string>()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => items.set(key, value),
      removeItem: (key: string) => items.delete(key),
    },
  })
})

test('checks once per visit, at most every six hours per browser, only still open comments', async () => {
  addSentComment({
    path: '/guia',
    pageTitle: 'Guia',
    link: '/guia',
    text: 'trecho',
    exact: 'trecho',
    prefix: '',
    suffix: '',
    kind: 'wrong',
    comment: 'erro',
    issue: 41,
  })
  const lookup = vi.fn(async () => [
    { issue: 41, status: 'corrected' as const },
  ])
  const visit = commentStatusVisit()
  await visit(lookup, 1_000_000)
  expect(readSentComments()[0]?.status).toBe('corrected')
  addSentComment({
    path: '/guia',
    pageTitle: 'Guia',
    link: '/guia',
    text: 'outro',
    exact: 'outro',
    prefix: '',
    suffix: '',
    kind: 'wrong',
    comment: 'erro',
    issue: 42,
  })
  await visit(lookup, 30_000_000)
  expect(lookup).toHaveBeenCalledTimes(1)
  const newVisit = commentStatusVisit()
  await newVisit(lookup, 2_000_000)
  expect(lookup).toHaveBeenCalledTimes(1)
  await commentStatusVisit()(lookup, 30_000_000)
  expect(lookup).toHaveBeenCalledTimes(2)
  expect(lookup).toHaveBeenLastCalledWith([42])
})
