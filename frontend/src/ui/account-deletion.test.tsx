import { render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test'
import { refreshSync } from '#/state/account-sync'
import { AccountPage } from './account'
import { AccountDeletion } from './account-deletion'

const BINDING = 'tem-estudo:sync-account'
const JOURNAL = 'tem-estudo:sync-journal'
const PROFILE = 'tem-estudo:profile'

beforeEach(() => {
  localStorage.clear()
})
afterEach(() => {
  vi.unstubAllGlobals()
})

const deletionSection = () =>
  within(screen.getByRole('region', { name: 'Excluir a conta' }))

test('the form posts to the server, names what goes and asks for the typed word', () => {
  render(<AccountDeletion canPublish />)
  const section = deletionSection()
  const field = section.getByLabelText(/escreva EXCLUIR/)
  expect(field).toBeRequired()
  expect(field.closest('form')).toHaveAttribute('action', '/auth/delete')
  expect(field.closest('form')).toHaveAttribute('method', 'post')
  expect(section.getByText(/não dá para desfazer/i)).toBeVisible()
  expect(section.getByText(/respostas de outros leitores/i)).toBeVisible()
  expect(section.getByText(/o e-mail e a senha, se houver/)).toBeVisible()
  // The same form serves an account with no Google behind it.
  expect(
    screen.getByRole('region', { name: 'Excluir a conta' }).textContent,
  ).not.toMatch(/Google/)
  expect(
    section.getByRole('button', { name: 'Excluir a conta para sempre' }),
  ).toBeVisible()
})

test('the default erases the public comments; keeping them is a choice the reader makes', () => {
  render(<AccountDeletion canPublish />)
  const keep = deletionSection().getByRole('checkbox', {
    name: /leitor removido/,
  })
  expect(keep).not.toBeChecked()
})

test('an account that never had a nickname has no comments to keep', () => {
  render(<AccountDeletion canPublish={false} />)
  expect(deletionSection().queryByRole('checkbox')).toBeNull()
  expect(
    deletionSection().getByRole('button', {
      name: 'Excluir a conta para sempre',
    }),
  ).toBeVisible()
})

test('after deletion the page says so, this device leaves sync and keeps its own data', async () => {
  localStorage.setItem(BINDING, '5')
  localStorage.setItem(
    JOURNAL,
    JSON.stringify({ profile: { at: 1, value: { age: 30 } } }),
  )
  localStorage.setItem(PROFILE, JSON.stringify({ age: 30 }))
  render(<AccountPage account={null} deleted />)
  expect(screen.getByText(/Sua conta foi excluída/)).toBeVisible()
  expect(screen.getByText(/continua neste aparelho/)).toBeVisible()
  await waitFor(() => expect(localStorage.getItem(BINDING)).toBeNull())
  expect(localStorage.getItem(JOURNAL)).toBeNull()
  expect(localStorage.getItem(PROFILE)).not.toBeNull()
})

test('opening the page without a deletion leaves the sync of this device alone', () => {
  localStorage.setItem(BINDING, '5')
  render(<AccountPage account={null} />)
  expect(screen.queryByText(/Sua conta foi excluída/)).toBeNull()
  expect(localStorage.getItem(BINDING)).toBe('5')
})

test('a device still joined to a deleted account uploads nothing under a new login', async () => {
  localStorage.setItem(BINDING, '5')
  localStorage.setItem(PROFILE, JSON.stringify({ age: 30 }))
  const fetched = vi.fn<typeof fetch>(async () =>
    Response.json({ accountId: 6, consent: true, data: {} }),
  )
  vi.stubGlobal('fetch', fetched)
  await refreshSync()
  expect(fetched).toHaveBeenCalledTimes(1)
  expect(fetched.mock.calls[0]?.[1]?.method).toBeUndefined()
})
