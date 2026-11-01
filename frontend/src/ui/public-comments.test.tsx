import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vite-plus/test'
import { PublicComments, CommentAudience } from './public-comments'
import { readAccount } from '#/content/account'
import {
  readPublicComments,
  writePublicComment,
} from '#/content/public-comments'

vi.mock('#/content/account', () => ({
  readAccount: vi.fn<() => Promise<null>>(async () => null),
}))
vi.mock('#/content/public-comments', () => ({
  readPublicComments: vi.fn<() => Promise<never[]>>(async () => []),
  writePublicComment: vi.fn<() => Promise<number>>(async () => 1),
}))

test('renders untrusted bodies as text and keeps reading available anonymously', () => {
  render(
    <PublicComments
      path="/dicas/exemplo"
      comments={[
        {
          id: 1,
          parentId: null,
          quote: 'Trecho antigo',
          body: '<img src=x onerror=alert(1)>',
          nickname: 'Leitora',
          edited: true,
          createdAt: 1000,
          own: false,
        },
      ]}
    />,
  )
  expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeVisible()
  expect(document.querySelector('img')).toBeNull()
  expect(screen.getByText('editado')).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull()
})

test('a signed-in reader picks public, publishes, and the page refreshes its conversation', async () => {
  vi.mocked(readAccount).mockResolvedValue({ nickname: 'Leitora' })
  const onDone = vi.fn<() => void>()
  const user = userEvent.setup()
  render(
    <>
      <CommentAudience path="/dicas/exemplo" quote="Um trecho" onDone={onDone}>
        <p>Formulário privado</p>
      </CommentAudience>
      <PublicComments path="/dicas/exemplo" comments={[]} />
    </>,
  )
  await user.click(await screen.findByRole('radio', { name: 'Público' }))
  expect(screen.queryByText('Formulário privado')).toBeNull()
  await user.type(
    screen.getByLabelText('Seu comentário público'),
    'Minha dúvida',
  )
  vi.mocked(readPublicComments).mockResolvedValue([
    {
      id: 1,
      parentId: null,
      quote: 'Um trecho',
      body: 'Minha dúvida',
      nickname: 'Leitora',
      edited: false,
      createdAt: 1,
      own: true,
      canReply: true,
    },
  ])
  await user.click(screen.getByRole('button', { name: 'Publicar' }))
  expect(writePublicComment).toHaveBeenCalledWith({
    data: {
      action: 'publish',
      path: '/dicas/exemplo',
      quote: 'Um trecho',
      body: 'Minha dúvida',
    },
  })
  expect(await screen.findByText('Minha dúvida')).toBeVisible()
  expect(onDone).toHaveBeenCalledOnce()
  await user.click(screen.getByRole('button', { name: 'Editar' }))
  const fields = screen.getAllByLabelText('Seu comentário público')
  await user.clear(fields[1]!)
  await user.type(fields[1]!, 'Revisto')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(writePublicComment).toHaveBeenLastCalledWith({
    data: { action: 'edit', id: 1, body: 'Revisto' },
  })
  await user.click(screen.getByRole('button', { name: 'Responder' }))
  const replies = screen.getAllByLabelText('Seu comentário público')
  await user.type(replies[1]!, 'Resposta')
  await user.click(screen.getAllByRole('button', { name: 'Publicar' })[1]!)
  expect(writePublicComment).toHaveBeenLastCalledWith({
    data: {
      action: 'publish',
      path: '/dicas/exemplo',
      quote: 'Um trecho',
      parentId: 1,
      body: 'Resposta',
    },
  })
  await user.click(screen.getByRole('button', { name: 'Apagar' }))
  expect(writePublicComment).toHaveBeenLastCalledWith({
    data: { action: 'delete', id: 1 },
  })
})
