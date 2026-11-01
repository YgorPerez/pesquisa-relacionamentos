import { render, screen } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'
import { PublicComments } from './public-comments'

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
