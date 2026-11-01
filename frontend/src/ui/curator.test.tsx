import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vite-plus/test'
import { decideComment } from '#/content/public-comments'
import { CuratorPage } from './curator'
import { CURATOR_DESK } from './curator.example'

vi.mock('#/content/public-comments', () => ({
  decideComment:
    vi.fn<() => Promise<{ ok: true } | { ok: false; problem: string }>>(),
}))

beforeEach(() => {
  vi.mocked(decideComment).mockReset()
  vi.mocked(decideComment).mockResolvedValue({ ok: true })
})

const entry = (text: string) =>
  screen.getByText(text).closest('article') as HTMLElement

test('anyone but the curator gets no data and no action', () => {
  render(<CuratorPage desk={null} onChanged={() => {}} />)
  expect(screen.getByText(/só do curador/)).toBeVisible()
  expect(screen.queryByRole('article')).toBeNull()
  expect(screen.queryByRole('button')).toBeNull()
  expect(screen.getByRole('link', { name: 'Ir para a conta' })).toHaveAttribute(
    'href',
    '/conta',
  )
})

test('what waits shows its state, its issue and a notice that failed', () => {
  render(<CuratorPage desk={CURATOR_DESK} onChanged={() => {}} />)
  const hidden = within(entry('Um comentário que três contas denunciaram.'))
  expect(hidden.getByText('Oculto')).toBeVisible()
  expect(hidden.getByText('3 denúncias')).toBeVisible()
  expect(hidden.getByRole('link', { name: 'Issue 41' })).toHaveAttribute(
    'href',
    'https://github.com/YgorPerez/pesquisa-relacionamentos-fontes/issues/41',
  )
  const reported = within(entry('Um comentário com uma denúncia, ainda no ar.'))
  expect(reported.getByText('1 denúncia')).toBeVisible()
  expect(reported.getByText(/aviso não saiu/)).toBeVisible()
})

test('restoring a hidden comment and keeping a reported one decide, then refresh', async () => {
  const onChanged = vi.fn<() => void>()
  const user = userEvent.setup()
  render(<CuratorPage desk={CURATOR_DESK} onChanged={onChanged} />)
  await user.click(
    within(entry('Um comentário que três contas denunciaram.')).getByRole(
      'button',
      { name: 'Restaurar' },
    ),
  )
  expect(decideComment).toHaveBeenCalledWith({
    data: { action: 'restore', id: 3 },
  })
  await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
  await user.click(
    within(entry('Um comentário com uma denúncia, ainda no ar.')).getByRole(
      'button',
      { name: 'Manter no ar' },
    ),
  )
  expect(decideComment).toHaveBeenLastCalledWith({
    data: { action: 'restore', id: 2 },
  })
})

test('removing asks first, can be cancelled and says when it was refused', async () => {
  const onChanged = vi.fn<() => void>()
  const user = userEvent.setup()
  render(<CuratorPage desk={CURATOR_DESK} onChanged={onChanged} />)
  const article = within(entry('Isso vale para quem mora no interior?'))
  await user.click(article.getByRole('button', { name: 'Remover' }))
  expect(decideComment).not.toHaveBeenCalled()
  await user.click(article.getByRole('button', { name: 'Cancelar' }))
  await user.click(article.getByRole('button', { name: 'Remover' }))
  vi.mocked(decideComment).mockResolvedValueOnce({
    ok: false,
    problem: 'Esta ação é só do curador.',
  })
  await user.click(article.getByRole('button', { name: 'Confirmar remoção' }))
  expect(decideComment).toHaveBeenCalledWith({
    data: { action: 'remove', id: 1 },
  })
  expect(await article.findByRole('alert')).toHaveTextContent(
    'Esta ação é só do curador.',
  )
  expect(onChanged).not.toHaveBeenCalled()
})

test('the edit history opens, and the older comments are a link away', async () => {
  const user = userEvent.setup()
  render(<CuratorPage desk={CURATOR_DESK} onChanged={() => {}} />)
  await user.click(
    within(entry('Isso vale para quem mora no interior?')).getByRole('button', {
      name: 'Versões anteriores (1)',
    }),
  )
  expect(await screen.findByText('A primeira versão do texto.')).toBeVisible()
  expect(
    screen.getByRole('link', { name: 'Ver comentários mais antigos' }),
  ).toHaveAttribute('href', '/curadoria?antes=4')
})

test('an empty desk says so', () => {
  render(
    <CuratorPage
      desk={{ pending: [], recent: [], before: null }}
      onChanged={() => {}}
    />,
  )
  expect(screen.getByText('Nada espera decisão.')).toBeVisible()
  expect(screen.getByText('Nenhum outro comentário.')).toBeVisible()
})
