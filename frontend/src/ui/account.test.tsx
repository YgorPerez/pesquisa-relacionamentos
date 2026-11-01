import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vite-plus/test'
import { AccountPage } from './account'

test('sync consent explains administrator access and declining sends only the decision', async () => {
  const decide = vi.fn<(accept: boolean) => void>()
  render(
    <AccountPage
      account={{ nickname: 'Leitora' }}
      syncStatus="ask"
      onSyncDecision={decide}
    />,
  )
  expect(screen.getByText(/Quem administra o servidor pode ler/)).toBeVisible()
  await userEvent.click(
    screen.getByRole('button', { name: 'Manter só neste aparelho' }),
  )
  expect(decide).toHaveBeenCalledWith(false)
})

test('reading is offered without login and Google is optional', () => {
  render(<AccountPage account={null} />)
  expect(
    screen.getByRole('link', { name: 'Entrar com Google' }),
  ).toHaveAttribute('href', '/auth/google')
  expect(screen.getByText(/Você pode ler tudo sem entrar/)).toBeVisible()
})

test('first use needs an adult declaration and rules acceptance', async () => {
  const user = userEvent.setup()
  render(<AccountPage account={{ nickname: null }} />)
  const submit = screen.getByRole('button', { name: 'Criar apelido' })
  expect(submit).toBeDisabled()
  await user.type(screen.getByLabelText('Apelido'), 'Leitora')
  await user.click(
    screen.getByRole('checkbox', { name: 'Declaro ter 18 anos ou mais' }),
  )
  expect(submit).toBeDisabled()
  await user.click(
    screen.getByRole('checkbox', { name: 'Li e aceito as regras acima' }),
  )
  expect(submit).toBeEnabled()
})

test('an existing account shows only its nickname and can leave', () => {
  render(<AccountPage account={{ nickname: 'Leitora' }} />)
  expect(screen.getByText('Você entrou como Leitora.')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Sair da conta' })).toBeVisible()
  expect(screen.queryByLabelText('Apelido')).toBeNull()
})
