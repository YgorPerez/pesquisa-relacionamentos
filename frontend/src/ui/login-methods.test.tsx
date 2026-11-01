import { render, screen, within } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'
import type { AccountMethods } from '#/content/method-notice'
import { LoginMethods, MethodMessage } from './login-methods'
import { LOGIN_METHODS, METHOD_NOTICE } from './login-methods.copy'

const emailOnly: AccountMethods = {
  google: false,
  email: 'reader@example.org',
  pendingEmail: null,
  canLinkGoogle: true,
  canChangePassword: true,
  canAddEmail: false,
  curator: false,
}
const googleOnly: AccountMethods = {
  ...emailOnly,
  google: true,
  email: null,
  canLinkGoogle: false,
  canChangePassword: false,
  canAddEmail: true,
}
const both: AccountMethods = {
  ...emailOnly,
  google: true,
  canLinkGoogle: false,
}
const button = (name: string) => screen.queryByRole('button', { name })
const formOf = (name: string) => button(name)!.closest('form')!

test('an email account links Google through a POST, and cannot remove its only method', () => {
  render(<LoginMethods methods={emailOnly} />)
  expect(screen.getByText('reader@example.org')).toBeVisible()
  const link = formOf(LOGIN_METHODS.linkGoogle)
  expect(link).toHaveAttribute('action', '/auth/link-google')
  expect(link).toHaveAttribute('method', 'post')
  expect(button(LOGIN_METHODS.removeEmail)).toBeNull()
  expect(screen.getByText(LOGIN_METHODS.onlyOne)).toBeVisible()
})

test('a Google account adds an email with a password in a plain form, and hears what happens next', () => {
  render(<LoginMethods methods={googleOnly} />)
  const form = formOf(LOGIN_METHODS.addSubmit)
  expect(form).toHaveAttribute('action', '/auth/add-email')
  expect(within(form).getByLabelText(LOGIN_METHODS.addEmail)).toBeRequired()
  const password = within(form).getByLabelText(LOGIN_METHODS.addPassword)
  expect(password).toBeRequired()
  expect(password).toHaveAttribute('autocomplete', 'new-password')
  expect(screen.getByText(LOGIN_METHODS.addExplanation)).toBeVisible()
  expect(button(LOGIN_METHODS.linkGoogle)).toBeNull()
  expect(button(LOGIN_METHODS.passwordSubmit)).toBeNull()
})

test('an address waiting for its link is shown, and the form stays to correct a typo', () => {
  render(
    <LoginMethods
      methods={{ ...googleOnly, pendingEmail: 'typo@example.org' }}
    />,
  )
  expect(
    screen.getByText(LOGIN_METHODS.pending('typo@example.org')),
  ).toBeVisible()
  expect(button(LOGIN_METHODS.addSubmit)).toBeVisible()
})

test('with both methods either can go, each by its own form', () => {
  render(<LoginMethods methods={both} />)
  for (const [name, method] of [
    [LOGIN_METHODS.removeGoogle, 'google'],
    [LOGIN_METHODS.removeEmail, 'email'],
  ] as const) {
    const form = formOf(name)
    expect(form).toHaveAttribute('action', '/auth/remove-method')
    expect(form.querySelector('input[name="method"]')).toHaveValue(method)
  }
  expect(screen.queryByText(LOGIN_METHODS.onlyOne)).toBeNull()
})

test('changing the password asks for the current one', () => {
  render(<LoginMethods methods={emailOnly} />)
  const form = formOf(LOGIN_METHODS.passwordSubmit)
  expect(form).toHaveAttribute('action', '/auth/change-password')
  expect(
    within(form).getByLabelText(LOGIN_METHODS.passwordCurrent),
  ).toBeRequired()
  expect(
    within(form).getByLabelText(LOGIN_METHODS.passwordNew),
  ).toHaveAttribute('minlength', '8')
  expect(screen.getByText(LOGIN_METHODS.passwordNote)).toBeVisible()
})

test('the curator is warned before removing Google, and must tick that the desk goes with it', () => {
  render(<LoginMethods methods={{ ...both, curator: true }} />)
  expect(screen.getByText(LOGIN_METHODS.curatorWarning)).toBeVisible()
  const form = formOf(LOGIN_METHODS.removeGoogle)
  const confirm = within(form).getByRole('checkbox', {
    name: LOGIN_METHODS.curatorConfirm,
  })
  expect(confirm).toBeRequired()
  expect(confirm).toHaveAttribute('name', 'lose-curator')
  expect(
    within(formOf(LOGIN_METHODS.removeEmail)).queryByRole('checkbox'),
  ).toBeNull()
})

test('a reader who is not the curator sees no word of it', () => {
  render(<LoginMethods methods={both} />)
  expect(screen.queryByText(LOGIN_METHODS.curatorWarning)).toBeNull()
})

test('nothing a server without Google or mail cannot do is offered', () => {
  render(
    <LoginMethods
      methods={{ ...emailOnly, canLinkGoogle: false, canChangePassword: false }}
    />,
  )
  expect(screen.queryByRole('button')).toBeNull()
})

test('a refusal is an alert and a result is a status', () => {
  const { rerender } = render(<MethodMessage notice="google-em-uso" />)
  expect(screen.getByRole('alert')).toHaveTextContent(
    METHOD_NOTICE['google-em-uso'],
  )
  rerender(<MethodMessage notice="senha-trocada" />)
  expect(screen.getByRole('status')).toHaveTextContent(
    METHOD_NOTICE['senha-trocada'],
  )
})
