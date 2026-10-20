// The Possible group screen (`/grupo-possivel`) in jsdom (ADR 0035), over the
// fixture data: the fixture's "Brazil" is only Acre (`e2e/library/dados`).
// The number pinned at the top on scroll, touch, keyboard and control sizes
// stay in the e2e (`e2e/possible-group.e2e.ts`), which has layout.
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { newCount, range, requirement } from '#/platform/screens/possible-group'
import { enterProfile } from '#/platform/screens/profile'

const PAGE = '/grupo-possivel'
const BUTTON = 'Usar na conta'

it('with nothing said, it already shows the example number and the Profile comes first', async () => {
  openScreen(PAGE)
  expect(await screen.findByRole('form', { name: 'Seu Perfil' })).toBeVisible()
  expect(range()).toMatch(/^entre .+ e .+/)
  // The sections, after the pinned number (which is also an `h2`).
  const sections = [
    ...document.querySelectorAll('main h2[data-slot="headline"]'),
  ].map((h) => h.textContent)
  expect(sections.slice(0, 3)).toEqual([
    'Seu Perfil',
    'Seus Requisitos',
    'A conta',
  ])
})

it('the Profile fills the sought age (±5) and orientation enters the count', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  await screen.findByRole('form', { name: 'Seu Perfil' })
  const before = range()
  await enterProfile(
    user,
    { gender: 'homem', seeks: 'mulheres', age: '30' },
    BUTTON,
  )
  await newCount(before)
  expect(requirement('age').getByLabelText('Idade de')).toHaveValue('25')
  expect(requirement('age').getByLabelText('até')).toHaveValue('35')
  expect(
    screen.getByText(/a conta só conta quem se interessa por homens/),
  ).toBeVisible()
})

it('each active Requirement changes the number, and releasing it goes back to "qualquer"', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  await enterProfile(
    user,
    { gender: 'mulher', seeks: 'homens', age: '28' },
    BUTTON,
  )
  let current = await newCount(null)

  await user.click(
    requirement('education').getByRole('radio', {
      name: 'superior completo',
    }),
  )
  current = await newCount(current)
  expect(requirement('education').cost()).toMatch(
    /^soltar só este: ×[\d,]+ \(\+.+\)$/,
  )

  await user.click(
    requirement('age').getByRole('button', { name: 'até: mais 1' }),
  )
  current = await newCount(current)
  expect(requirement('age').value()).toBe('23 a 34 anos')

  await user.click(screen.getByRole('button', { name: 'Soltar escolaridade' }))
  await newCount(current)
  expect(
    requirement('education').getByRole('radio', { name: 'qualquer' }),
  ).toBeChecked()
})

it('"sem filhos" is disabled when seeking men, with the reason', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  await enterProfile(
    user,
    { gender: 'homem', seeks: 'homens', age: '30' },
    BUTTON,
  )
  await newCount(null)
  const checkbox = requirement('children').getByRole('checkbox', {
    name: 'Só quem não tem filhos',
  })
  // Base UI's `Checkbox` is a `role="checkbox"`, disabled through ARIA.
  expect(checkbox).toHaveAttribute('aria-disabled', 'true')
  expect(checkbox).toHaveAccessibleDescription(
    'O Censo só pergunta filhos às mulheres. Procurando homens, não dá para filtrar.',
  )
})

it('state and municipality are saved on the device and come back on reopening', async () => {
  const user = userEvent.setup()
  const { unmount } = openScreen(PAGE)
  await enterProfile(
    user,
    { gender: 'homem', seeks: 'mulheres', age: '30' },
    BUTTON,
  )
  await user.click(
    requirement('place').getByRole('combobox', { name: 'Estado' }),
  )
  await user.click(await screen.findByRole('option', { name: 'Acre' }))
  const municipality = requirement('place').getByRole('combobox', {
    name: 'Município',
  })
  await waitFor(() => expect(municipality).toBeEnabled())
  await user.click(municipality)
  await user.click(await screen.findByRole('option', { name: 'Rio Branco' }))
  expect(requirement('place').value()).toBe('Rio Branco (AC)')
  expect(
    JSON.parse(localStorage.getItem('tem-estudo:requirements') ?? 'null'),
  ).toMatchObject({ place: { state: 'AC', municipality: '1200401' } })

  unmount()
  openScreen(PAGE)
  expect(
    await screen.findByRole('combobox', { name: 'Município' }),
  ).toHaveTextContent('Rio Branco')
})

it('the state is chosen by keyboard and goes back to the whole of Brazil', async () => {
  const user = userEvent.setup()
  openScreen(PAGE)
  await enterProfile(
    user,
    { gender: 'homem', seeks: 'mulheres', age: '30' },
    BUTTON,
  )
  // Once the Profile is saved, focus goes to its summary in the next box: the
  // keyboard only starts after that, or the summary takes the focus from the
  // state midway.
  const summary = await within(
    screen.getByRole('region', { name: 'Seu Perfil' }),
  ).findByText(/Seu Perfil:/)
  await waitFor(() => expect(summary).toHaveFocus())
  const state = requirement('place').getByRole('combobox', { name: 'Estado' })
  expect(state).toHaveTextContent('Brasil inteiro')
  state.focus()
  await user.keyboard('{Enter}')
  expect(await screen.findByRole('listbox')).toBeVisible()
  // The list opens and only then focuses the checked option: the arrow moves
  // from there.
  await waitFor(() =>
    expect(
      screen.getByRole('option', { name: 'Brasil inteiro' }),
    ).toHaveFocus(),
  )
  await user.keyboard('{ArrowDown}{Enter}')
  await waitFor(() => expect(state).toHaveTextContent('Acre'))
  expect(requirement('place').value()).toBe('Acre')
  await user.click(state)
  await user.click(
    await screen.findByRole('option', { name: 'Brasil inteiro' }),
  )
  expect(state).toHaveTextContent('Brasil inteiro')
  expect(
    requirement('place').queryByRole('combobox', { name: 'Município' }),
  ).toBeNull()
})
