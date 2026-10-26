// The Profile in the Guide, in jsdom (ADR 0035), over the fixture content.
// The Guide has one Profile box and two Questions: in the first, the 1st
// finding comes from men and women aged 18 to 35 and the 2nd from man-woman
// couples, and the Tip cites both; the second only has the man-woman couples
// finding. The link that scrolls to the form, the options' size and the
// content order stay in the e2e (`e2e/profile.e2e.ts`).
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { enterProfile, type ProfileInForm } from '#/platform/screens/profile'

const GUIDE = '/onde-conhecer-pessoas'
const NO_DATA = 'Não há dado deste estudo para o seu Perfil.'
const BUTTON = 'Ver o que vale para mim'

const FIRST = 'Onde os casais se conhecem hoje?'
const SECOND = 'App ou presencial, onde tenho mais chance?'
const question = (name: string) => screen.getByRole('region', { name })

/** Each finding of the first Question's "O que a evidência diz", in order. */
const findings = () =>
  within(
    within(question(FIRST)).getByRole('region', {
      name: 'O que a evidência diz',
    }),
  ).getAllByRole('listitem')
const badge = (finding: HTMLElement | undefined) =>
  finding?.querySelector('[data-slot="selo-voce"]')?.textContent ?? null
const variesByProfile = (name = FIRST) =>
  within(question(name)).getByRole('region', {
    name: 'Varia conforme o Perfil?',
  })
const profileBox = () => screen.getByRole('region', { name: 'Seu Perfil' })

async function openWithProfile(url: string, profile: ProfileInForm) {
  const user = userEvent.setup()
  const screenHandle = openScreen(url)
  await enterProfile(user, profile, BUTTON)
  return { user, ...screenHandle }
}

it('with nothing chosen, the form asks for an option or the age, and does not save', async () => {
  const user = userEvent.setup()
  openScreen(GUIDE)
  await enterProfile(user, {}, BUTTON)
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Escolha ao menos uma opção ou diga a sua idade.',
  )
  expect(localStorage.getItem('tem-estudo:profile')).toBeNull()
})

it('with a Profile, marks the finding that applies and says which has no data', async () => {
  await openWithProfile(GUIDE, {
    gender: 'homem',
    seeks: 'homens',
    age: '30',
  })
  expect(
    await within(profileBox()).findByText(/Seu Perfil:/),
  ).toHaveTextContent('Seu Perfil: homem, procura homens, 30 anos')
  const [first, second] = findings()
  expect(badge(first)).toBe('vale para você')
  expect(first).toHaveTextContent(
    'Vale para: homens e mulheres, de 18 a 35 anos.',
  )
  expect(first).not.toHaveTextContent(NO_DATA)
  // Man-woman couples do not apply to a man seeking men.
  expect(badge(second)).toBeNull()
  expect(second).toHaveTextContent(`Vale para: casais homem-mulher. ${NO_DATA}`)
  expect(variesByProfile()).toHaveTextContent(
    '1 de 2 achados tem dado para o seu Perfil.',
  )
})

it('someone seeking both sees which side has data', async () => {
  await openWithProfile(GUIDE, {
    gender: 'homem',
    seeks: 'ambos',
    age: '30',
  })
  await within(profileBox()).findByText(/Seu Perfil:/)
  const [first, second] = findings()
  expect(badge(first)).toBe('vale para você')
  expect(badge(second)).toBe('vale para você quando procura mulheres')
})

it('"outro" only matches what did not split by gender: here, nothing covers', async () => {
  await openWithProfile(GUIDE, { gender: 'outro', seeks: 'homens' })
  await within(profileBox()).findByText(/Seu Perfil:/)
  // Two findings and the Tip of the first Question, and the one finding and
  // the Tip of the second.
  expect(within(question(FIRST)).getAllByText(NO_DATA)).toHaveLength(3)
  expect(variesByProfile()).toHaveTextContent(
    'Nenhum dos 2 achados tem dado para o seu Perfil.',
  )
})

it('"mudar" opens the filled-in form, and deleting goes back to the Guide without a Profile', async () => {
  const { user } = await openWithProfile(GUIDE, {
    gender: 'mulher',
    seeks: 'mulheres',
    age: '24',
  })
  await user.click(
    await within(profileBox()).findByRole('button', { name: 'mudar' }),
  )
  const form = within(screen.getByRole('form', { name: 'Seu Perfil' }))
  expect(form.getByRole('radio', { name: 'mulher' })).toBeChecked()
  expect(form.getByRole('radio', { name: 'mulheres' })).toBeChecked()
  expect(form.getByLabelText('Sua idade')).toHaveValue(24)

  await enterProfile(user, { seeks: 'homens' }, BUTTON)
  expect(
    await within(profileBox()).findByText(/Seu Perfil:/),
  ).toHaveTextContent('Seu Perfil: mulher, procura homens, 24 anos')

  await user.click(within(profileBox()).getByRole('button', { name: 'mudar' }))
  await user.click(screen.getByRole('button', { name: 'Apagar o Perfil' }))
  expect(localStorage.getItem('tem-estudo:profile')).toBeNull()
  expect(document.querySelector('[data-slot="selo-voce"]')).toBeNull()
})

it('the Profile applies to each Question apart, with the notice only where no study split it', async () => {
  await openWithProfile(GUIDE, {
    gender: 'homem',
    seeks: 'homens',
    age: '30',
  })
  await within(profileBox()).findByText(/Seu Perfil:/)
  expect(
    within(question(SECOND)).getByText(/Nenhum estudo desta Pergunta separou/),
  ).toHaveTextContent('homem, procura homens, 30 anos')
  expect(
    within(question(FIRST)).queryByText(/Nenhum estudo desta Pergunta/),
  ).toBeNull()
  expect(variesByProfile(SECOND)).toHaveTextContent(
    'O único achado não tem dado para o seu Perfil.',
  )
})

it('the saved Profile is still there when the Guide opens again', async () => {
  const { unmount } = await openWithProfile(GUIDE, { gender: 'mulher' })
  await within(profileBox()).findByText(/Seu Perfil:/)
  unmount()

  openScreen(GUIDE)
  expect(
    await within(
      await screen.findByRole('region', { name: 'Seu Perfil' }),
    ).findByText(/Seu Perfil:/),
  ).toHaveTextContent('Seu Perfil: mulher')
})
