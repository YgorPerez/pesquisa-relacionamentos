import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vite-plus/test'
import { reportPublicComment } from '#/content/public-comments'
import { CommentReport } from './comment-report'

vi.mock('#/content/public-comments', () => ({
  reportPublicComment:
    vi.fn<() => Promise<{ ok: true } | { ok: false; problem: string }>>(),
}))

beforeEach(() => {
  vi.mocked(reportPublicComment).mockReset()
  vi.mocked(reportPublicComment).mockResolvedValue({ ok: true })
})

test('a report takes a confirmation, and the conversation refreshes', async () => {
  const changed = vi.fn<() => void>()
  window.addEventListener('public-comments-changed', changed)
  const user = userEvent.setup()
  render(<CommentReport id={7} onProblem={() => {}} />)
  await user.click(screen.getByRole('button', { name: 'Denunciar' }))
  expect(reportPublicComment).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Confirmar denúncia' }))
  expect(reportPublicComment).toHaveBeenCalledWith({ data: 7 })
  await waitFor(() => expect(changed).toHaveBeenCalled())
  window.removeEventListener('public-comments-changed', changed)
})

test('cancelling sends nothing and gives the button back', async () => {
  const user = userEvent.setup()
  render(<CommentReport id={7} onProblem={() => {}} />)
  await user.click(screen.getByRole('button', { name: 'Denunciar' }))
  await user.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(screen.getByRole('button', { name: 'Denunciar' })).toBeVisible()
  expect(reportPublicComment).not.toHaveBeenCalled()
})

test('a refusal and a failure reach the reader', async () => {
  const onProblem = vi.fn<(problem: string) => void>()
  const user = userEvent.setup()
  render(<CommentReport id={7} onProblem={onProblem} />)
  vi.mocked(reportPublicComment).mockResolvedValueOnce({
    ok: false,
    problem: 'Limite',
  })
  await user.click(screen.getByRole('button', { name: 'Denunciar' }))
  await user.click(screen.getByRole('button', { name: 'Confirmar denúncia' }))
  await waitFor(() => expect(onProblem).toHaveBeenCalledWith('Limite'))
  vi.mocked(reportPublicComment).mockRejectedValueOnce(new Error('offline'))
  await user.click(screen.getByRole('button', { name: 'Confirmar denúncia' }))
  await waitFor(() =>
    expect(onProblem).toHaveBeenCalledWith(
      'Não foi possível enviar a denúncia. Tente de novo.',
    ),
  )
})
