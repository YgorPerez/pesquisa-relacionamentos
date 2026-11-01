// The notice of a first report. GitHub here is a fake `fetch`; no test reaches
// the real API.
import { expect, test, vi } from 'vite-plus/test'
import { reportNotifier } from './report-issue'

const COMMENT = { id: 12, path: '/dicas/exemplo' }
const created = () => new Response(JSON.stringify({ number: 41 }), { status: 201 })

test('opens one issue in the private repo with the links the curator needs and nothing else', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>(async () => created())
  const issue = await reportNotifier({ fetch, token: 'github_pat_test' })(COMMENT)
  expect(issue).toBe(41)
  expect(fetch).toHaveBeenCalledTimes(1)
  const [url, init] = fetch.mock.calls[0]!
  expect(url).toBe(
    'https://api.github.com/repos/YgorPerez/pesquisa-relacionamentos-fontes/issues',
  )
  expect(JSON.parse(String(init?.body))).toEqual({
    title: 'Denúncia: comentário público 12',
    labels: [],
    body: [
      'Um comentário público recebeu a primeira denúncia.',
      '',
      '**Decidir:** https://temestudo.cloud/curadoria#comentario-12',
      '',
      '**Página:** https://temestudo.cloud/dicas/exemplo#comentario-12',
    ].join('\n'),
  })
})

test('without a token no request goes out', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>(async () => created())
  expect(await reportNotifier({ fetch, token: undefined })(COMMENT)).toBeNull()
  expect(fetch).not.toHaveBeenCalled()
})

test('a refusal, an offline GitHub and one that never answers all come back as no issue', async () => {
  const answers: typeof globalThis.fetch[] = [
    async () => new Response('{}', { status: 500 }),
    async () => {
      throw new Error('offline')
    },
    (_, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('late')))
      }),
  ]
  for (const fetch of answers)
    expect(
      await reportNotifier({ fetch, token: 'github_pat_test', timeoutMs: 1 })(
        COMMENT,
      ),
    ).toBeNull()
})
