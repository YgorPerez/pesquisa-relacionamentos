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

test('a reader who declined can still join later', async () => {
  const decide = vi.fn<(accept: boolean) => void>()
  render(
    <AccountPage
      account={{ nickname: 'Leitora' }}
      syncStatus="declined"
      onSyncDecision={decide}
    />,
  )
  expect(screen.getByText(/Nada foi enviado à conta/)).toBeVisible()
  await userEvent.click(
    screen.getByRole('button', { name: 'Juntar e sincronizar' }),
  )
  expect(decide).toHaveBeenCalledWith(true)
})

test('an active device can stop, and says what stopping keeps', () => {
  render(<AccountPage account={{ nickname: 'Leitora' }} syncStatus="active" />)
  expect(
    screen.getByRole('button', { name: 'Parar neste aparelho' }),
  ).toBeVisible()
  expect(screen.getByText(/Parar não apaga/)).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Voltar aos dados da conta' }),
  ).toBeNull()
})

test('a device holding link data offers the way back to the account', () => {
  localStorage.setItem(
    'tem-estudo:sync-link-fields',
    JSON.stringify(['profile']),
  )
  render(<AccountPage account={{ nickname: 'Leitora' }} syncStatus="active" />)
  expect(screen.getByText(/Um link recebido trocou/)).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Voltar aos dados da conta' }),
  ).toBeVisible()
})

test('nothing about sync shows before the nickname exists', () => {
  render(<AccountPage account={{ nickname: null }} syncStatus="ask" />)
  expect(screen.queryByText(/Quem administra o servidor/)).toBeNull()
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
