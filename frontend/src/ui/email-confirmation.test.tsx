import { render, screen } from '@testing-library/react'
import { expect, test } from 'vite-plus/test'
import { EmailConfirmation } from './email-confirmation'
import { EMAIL_CONFIRMATION } from './email-confirmation.copy'

test('a live link names the address and spends the token by a POST', () => {
  render(<EmailConfirmation token="the-token" email="added@example.org" />)
  expect(
    screen.getByText(EMAIL_CONFIRMATION.explanation('added@example.org')),
  ).toBeVisible()
  const form = screen
    .getByRole('button', { name: EMAIL_CONFIRMATION.submit })
    .closest('form')!
  expect(form).toHaveAttribute('action', '/auth/confirm-email')
  expect(form).toHaveAttribute('method', 'post')
  expect(form.querySelector('input[name="token"]')).toHaveValue('the-token')
})

test('a link that does nothing here says why and leads back to the account', () => {
  render(<EmailConfirmation message={EMAIL_CONFIRMATION.otherAccount} />)
  expect(screen.getByRole('status')).toHaveTextContent(
    EMAIL_CONFIRMATION.otherAccount,
  )
  expect(screen.queryByRole('button')).toBeNull()
  expect(
    screen.getByRole('link', { name: EMAIL_CONFIRMATION.back }),
  ).toHaveAttribute('href', '/conta')
})
