import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { expect, test } from 'vite-plus/test'
import { TOO_MANY_ATTEMPTS, WRONG_LOGIN } from '#/content/email-refusal'
import { NICKNAME_TAKEN } from '#/content/nickname-refusal'
import { server } from '@/platform/screens/network'
import { ACCOUNT } from './account.copy'
import { AccountEntry } from './account-entry'
import { EMAIL_REFUSAL, ENTRY } from './account-entry.copy'

const next = () => screen.getByRole('button', { name: ENTRY.next })
const heading = (number: number, name: string) =>
  screen.getByRole('heading', { name: ENTRY.step(number, name) })

async function fillToLastStep() {
  await userEvent.type(
    screen.getByLabelText(ENTRY.emailRegister),
    'reader@example.org',
  )
  await userEvent.type(
    screen.getByLabelText(ENTRY.passwordRegister),
    'a long password',
  )
  await userEvent.click(next())
  await userEvent.type(screen.getByLabelText(ACCOUNT.nickname), 'Leitora')
  await userEvent.click(next())
}

test('Google is the first way in, and says it also creates the account', () => {
  render(<AccountEntry />)
  const google = screen.getByRole('link', { name: ENTRY.google })
  expect(google).toHaveAttribute('href', '/auth/google')
  expect(screen.getAllByRole('link')[0]).toBe(google)
  expect(screen.getByText(ENTRY.googleNote)).toBeVisible()
})

test('sign-up shows one step at a time and holds back an invalid one', async () => {
  render(<AccountEntry />)
  expect(heading(1, ENTRY.accessStep)).toBeVisible()
  expect(screen.getByLabelText(ACCOUNT.nickname)).not.toBeVisible()
  await userEvent.click(next())
  expect(screen.getByLabelText(ENTRY.emailRegister)).toBeVisible()
  await userEvent.type(
    screen.getByLabelText(ENTRY.emailRegister),
    'reader@example.org',
  )
  await userEvent.type(
    screen.getByLabelText(ENTRY.passwordRegister),
    'a long password',
  )
  await userEvent.click(next())
  expect(heading(2, ENTRY.nicknameStep)).toHaveFocus()
  expect(screen.getByLabelText(ENTRY.emailRegister)).not.toBeVisible()
})

test('going back keeps what was typed', async () => {
  render(<AccountEntry />)
  await fillToLastStep()
  await userEvent.click(screen.getByRole('button', { name: ENTRY.back }))
  expect(screen.getByLabelText(ACCOUNT.nickname)).toHaveValue('Leitora')
})

test('a nickname in use returns to its step with everything kept', async () => {
  server.use(
    http.post('*/auth/register', () =>
      HttpResponse.json({ refusal: NICKNAME_TAKEN }, { status: 400 }),
    ),
  )
  render(<AccountEntry />)
  await fillToLastStep()
  await userEvent.click(screen.getByRole('checkbox', { name: ACCOUNT.adult }))
  await userEvent.click(screen.getByRole('checkbox', { name: ACCOUNT.rules }))
  await userEvent.click(screen.getByRole('button', { name: ENTRY.register }))
  expect(await screen.findByRole('alert')).toHaveTextContent(
    EMAIL_REFUSAL[NICKNAME_TAKEN],
  )
  expect(heading(2, ENTRY.nicknameStep)).toHaveFocus()
  expect(screen.getByLabelText(ACCOUNT.nickname)).toHaveValue('Leitora')
  expect(screen.getByLabelText(ENTRY.emailRegister)).toHaveValue(
    'reader@example.org',
  )
})

test('a refused login stays on the page with the email kept', async () => {
  server.use(
    http.post('*/auth/login', () =>
      HttpResponse.json({ refusal: WRONG_LOGIN }, { status: 400 }),
    ),
  )
  render(<AccountEntry />)
  await userEvent.type(
    screen.getByLabelText(ENTRY.emailLogin),
    'reader@example.org',
  )
  await userEvent.type(
    screen.getByLabelText(ENTRY.passwordLogin),
    'a wrong password',
  )
  await userEvent.click(screen.getByRole('button', { name: ENTRY.login }))
  expect(await screen.findByRole('alert')).toHaveTextContent(
    EMAIL_REFUSAL[WRONG_LOGIN],
  )
  expect(screen.getByLabelText(ENTRY.emailLogin)).toHaveValue(
    'reader@example.org',
  )
})

test('a refusal that came back in the address shows in its section', () => {
  render(<AccountEntry signUpRefusal={TOO_MANY_ATTEMPTS} />)
  expect(screen.getByRole('alert')).toHaveTextContent(
    EMAIL_REFUSAL[TOO_MANY_ATTEMPTS],
  )
})
