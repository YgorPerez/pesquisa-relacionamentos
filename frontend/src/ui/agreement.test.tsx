import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vite-plus/test'
import { Agreement } from './agreement'

test('the browser holds the form until it is ticked, and it toggles as a plain field', async () => {
  render(<Agreement name="rules">Li e aceito</Agreement>)
  const box = screen.getByRole('checkbox', { name: 'Li e aceito' })
  expect(box).toBeRequired()
  expect(box).toHaveAttribute('name', 'rules')
  await userEvent.click(box)
  expect(box).toBeChecked()
})
