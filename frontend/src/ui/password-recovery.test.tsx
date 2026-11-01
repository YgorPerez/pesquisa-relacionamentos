import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vite-plus/test'
import { PasswordRecovery } from './password-recovery'
import { RECOVERY } from './password-recovery.copy'

test('a reader enters an email and can return to login', async () => {
  render(<PasswordRecovery />)
  await userEvent.type(screen.getByLabelText(RECOVERY.email), 'reader@example.org')
  expect(screen.getByLabelText(RECOVERY.email)).toHaveValue('reader@example.org')
  expect(screen.getByRole('button', { name: RECOVERY.send })).toBeEnabled()
  expect(screen.getByRole('link', { name: RECOVERY.back })).toHaveAttribute('href', '/conta')
})
test('a reset explains session revocation and accepts a new password', async () => {
  render(<PasswordRecovery token="example-token" />)
  expect(screen.getByText(RECOVERY.note)).toBeVisible()
  await userEvent.type(screen.getByLabelText(RECOVERY.password), 'new password')
  expect(screen.getByLabelText(RECOVERY.password)).toBeValid()
})
test('unconfigured recovery explains why there is no form', () => {
  render(<PasswordRecovery disabled message={RECOVERY.unavailable} />)
  expect(screen.getByRole('status')).toHaveTextContent(RECOVERY.unavailable)
  expect(screen.queryByRole('button')).toBeNull()
})
