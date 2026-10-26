// The consent for the sensitive Requirements in "Compartilhar" (LGPD art. 11,
// I), on the Possible group screen in jsdom (ADR 0035): without the box
// checked, the copied link leaves them out and the sentence says so.
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DEFAULT_REQUIREMENTS } from '@tem-estudo/rules/requirements'
import { expect, it } from 'vite-plus/test'
import { openPossibleGroup } from '#/platform/screens/possible-group'
import { CONSENT_STORAGE, consentLabel } from './share-consent.copy'

function saveRequirements(change: object) {
  localStorage.setItem(
    'tem-estudo:requirements',
    JSON.stringify({ ...DEFAULT_REQUIREMENTS, ...change }),
  )
}

const share = () => within(screen.getByRole('region', { name: 'Compartilhar' }))

it('a sensitive Requirement stays out of the link until the visitor checks the box', async () => {
  const user = userEvent.setup()
  saveRequirements({ bisexual: true, nonSmoker: true })
  openPossibleGroup()
  await screen.findByRole('region', { name: 'Compartilhar' })

  const consent = await share().findByRole('checkbox', {
    name: consentLabel(['bisexual']),
  })
  expect(consent).not.toBeChecked()
  expect(
    share().getByText(
      'Este link mostra: não fuma. Ficou de fora 1 Requisito sensível: bissexual.',
    ),
  ).toBeVisible()
  await user.click(share().getByRole('button', { name: 'Copiar link' }))
  expect(await navigator.clipboard.readText()).toMatch(/\?v=1&nao-fuma=sim$/)

  await user.click(consent)
  expect(consent).toBeChecked()
  expect(
    share().getByText('Este link mostra: não fuma, bissexual.'),
  ).toBeVisible()
  await user.click(share().getByRole('button', { name: 'Copiar link' }))
  expect(await navigator.clipboard.readText()).toMatch(
    /\?v=1&nao-fuma=sim&bissexual=sim$/,
  )
})

it('says the sensitive Requirements stay saved only on this device and never reach the count of visits', async () => {
  saveRequirements({ notObese: true, weeklyWorship: true })
  openPossibleGroup()
  await screen.findByRole('region', { name: 'Compartilhar' })
  // The box names each one, in words.
  expect(
    await share().findByRole('checkbox', {
      name: consentLabel(['obesity', 'worship']),
    }),
  ).not.toBeChecked()
  expect(consentLabel(['obesity', 'worship'])).toBe(
    'Incluir no link: IMC abaixo de 30 e vai à religião toda semana',
  )
  expect(share().getByText(CONSENT_STORAGE)).toBeVisible()
})

it('with no sensitive Requirement on, there is nothing to consent to', async () => {
  saveRequirements({ nonSmoker: true })
  openPossibleGroup()
  await screen.findByRole('region', { name: 'Compartilhar' })
  expect(await share().findByText('Este link mostra: não fuma.')).toBeVisible()
  expect(share().queryByRole('checkbox')).toBeNull()
})
