import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vite-plus/test'
import { NICKNAME_TAKEN } from '#/content/nickname-refusal'
import { AccountPage } from './account'
import {
  ACCOUNT,
  ACCOUNT_INTRO,
  NICKNAME_REFUSAL,
  SYNC_DECLINED,
  SYNC_EXPLANATION,
  SYNC_LINK,
  SYNC_STOP_NOTE,
} from './account.copy'

test('sync consent explains administrator access and declining sends only the decision', async () => {
  const decide = vi.fn<(accept: boolean) => void>()
  render(
    <AccountPage
      account={{ nickname: 'Leitora' }}
      syncStatus="ask"
      onSyncDecision={decide}
    />,
  )
  expect(screen.getByText(SYNC_EXPLANATION)).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: ACCOUNT.keepHere }))
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
  expect(screen.getByText(SYNC_DECLINED)).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: ACCOUNT.join }))
  expect(decide).toHaveBeenCalledWith(true)
})

test('an active device can stop, and says what stopping keeps', () => {
  render(<AccountPage account={{ nickname: 'Leitora' }} syncStatus="active" />)
  expect(screen.getByRole('button', { name: ACCOUNT.stop })).toBeVisible()
  expect(screen.getByText(SYNC_STOP_NOTE)).toBeVisible()
  expect(
    screen.queryByRole('button', { name: ACCOUNT.backToAccount }),
  ).toBeNull()
})

test('a device holding link data offers the way back to the account', () => {
  localStorage.setItem(
    'tem-estudo:sync-link-fields',
    JSON.stringify(['profile']),
  )
  render(<AccountPage account={{ nickname: 'Leitora' }} syncStatus="active" />)
  expect(screen.getByText(SYNC_LINK)).toBeVisible()
  expect(
    screen.getByRole('button', { name: ACCOUNT.backToAccount }),
  ).toBeVisible()
})

test('nothing about sync shows before the nickname exists', () => {
  render(<AccountPage account={{ nickname: null }} syncStatus="ask" />)
  expect(screen.queryByText(SYNC_EXPLANATION)).toBeNull()
})

test('reading is offered without login and Google is optional', () => {
  render(<AccountPage account={null} />)
  expect(screen.getByRole('link', { name: ACCOUNT.signIn })).toHaveAttribute(
    'href',
    '/auth/google',
  )
  expect(screen.getByText(ACCOUNT_INTRO)).toBeVisible()
})

test('email login and registration have separately labelled browser forms', async () => {
  render(<AccountPage account={null} />)
  const login = screen.getByRole('button', { name: 'Entrar com e-mail' }).closest('form')!
  expect(login).toHaveAttribute('action', '/auth/login')
  await userEvent.type(screen.getByLabelText('E-mail para entrar'), 'reader@example.org')
  expect(screen.getByLabelText('E-mail para entrar')).toHaveValue('reader@example.org')
  const register = screen.getByRole('button', { name: 'Criar conta com e-mail' }).closest('form')!
  expect(register).toHaveAttribute('action', '/auth/register')
  expect(screen.getByRole('checkbox', { name: ACCOUNT.adult })).toBeRequired()
})

test('the first nickname is a plain form the browser checks, ready without JavaScript', () => {
  render(<AccountPage account={{ nickname: null }} />)
  const submit = screen.getByRole('button', { name: ACCOUNT.createNickname })
  expect(submit).toBeEnabled()
  expect(submit.closest('form')).toHaveAttribute('action', '/auth/nickname')
  expect(screen.getByLabelText(ACCOUNT.nickname)).toBeRequired()
  for (const name of [ACCOUNT.adult, ACCOUNT.rules])
    expect(screen.getByRole('checkbox', { name })).toBeRequired()
  expect(screen.queryByRole('alert')).toBeNull()
})

test('a refusal from the server shows above the nickname form', () => {
  render(
    <AccountPage
      account={{ nickname: null }}
      nicknameRefusal={NICKNAME_TAKEN}
    />,
  )
  expect(screen.getByRole('alert')).toHaveTextContent(
    NICKNAME_REFUSAL[NICKNAME_TAKEN],
  )
})

test('an existing account shows only its nickname and can leave', () => {
  render(<AccountPage account={{ nickname: 'Leitora' }} />)
  expect(screen.getByText(ACCOUNT.signedInAs('Leitora'))).toBeVisible()
  expect(screen.getByRole('button', { name: ACCOUNT.signOut })).toBeVisible()
  expect(screen.queryByLabelText(ACCOUNT.nickname)).toBeNull()
})
