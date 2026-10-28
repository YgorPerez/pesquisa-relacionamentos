import { expect, test } from 'vite-plus/test'
import { issueStatuses, readIssueNumbers } from './comment-status'

test('returns only status, caches successful answers for ten minutes and retries failures', async () => {
  let calls = 0
  let now = 0
  const lookup = issueStatuses(
    async (input) => {
      calls++
      const number = Number(new Request(input).url.split('/').at(-1))
      if (number === 4) return new Response('', { status: 404 })
      return Response.json({
        state: number === 1 ? 'open' : 'closed',
        state_reason: number === 3 ? 'not_planned' : 'completed',
        body: 'private',
      })
    },
    () => now,
  )
  expect(await lookup([1, 2, 3, 4], 'token')).toEqual([
    { issue: 1, status: 'received' },
    { issue: 2, status: 'corrected' },
    { issue: 3, status: 'not-planned' },
  ])
  await lookup([1, 4], 'token')
  expect(calls).toBe(5)
  now = 600_000
  await lookup([1], 'token')
  expect(calls).toBe(6)
  expect(await lookup([1], undefined)).toEqual([])
})

test('accepts only a bounded list of positive integer issue numbers', () => {
  expect(readIssueNumbers([2, 2, 5])).toEqual([2, 5])
  for (const bad of [
    null,
    '1',
    [0],
    [-1],
    [1.2],
    ['1'],
    Array.from({ length: 101 }, () => 1),
  ])
    expect(() => readIssueNumbers(bad)).toThrow('Invalid status request.')
})

test('requests the private repository with authorization, omitting private text and unknown states', async () => {
  const requests: Request[] = []
  const lookup = issueStatuses(async (input, init) => {
    requests.push(new Request(input, init))
    return Response.json({
      state: 'closed',
      state_reason: null,
      body: 'private',
    })
  })
  expect(await lookup([57], 'secret')).toEqual([])
  expect(requests[0]?.url).toBe(
    'https://api.github.com/repos/YgorPerez/pesquisa-relacionamentos-fontes/issues/57',
  )
  expect(requests[0]?.headers.get('authorization')).toBe('Bearer secret')
  expect(
    await issueStatuses(async () => {
      throw new TypeError('offline')
    })([1], 'token'),
  ).toEqual([])
})
