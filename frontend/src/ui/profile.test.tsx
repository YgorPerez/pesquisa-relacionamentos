// The Profile in the Guide, in jsdom (ADR 0035), over the fixture content.
// The Guide has one Profile box. The first answer's key number comes from
// men and women aged 18 to 35; the second answer has no key number. A
// sentence of the first Chapter marks the finding about ages 18 to 24, and
// the Tip of the second Chapter cites both Fact sheets. The options' size and
// the content order stay in the e2e (`e2e/profile.e2e.ts`).
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { enterProfile, type ProfileInForm } from '#/platform/screens/profile'

const GUIDE = '/onde-conhecer-pessoas'
const BUTTON = 'Ver o que vale para mim'

const FIRST = 'Onde os casais se conhecem hoje?'
const SECOND = 'App ou presencial, onde tenho mais chance?'
const answer = (name: string) => screen.getByRole('region', { name })
const profileBox = () => screen.getByRole('region', { name: 'Seu Perfil' })
const forYourProfile = (name: string) =>
  answer(name).querySelector('[data-slot="para-o-seu-perfil"]')
/** The "vale para você" a sentence of the first Chapter carries. */
const markInText = () =>
  document.querySelector<HTMLElement>('[data-voce="app-entre-os-mais-novos"]')
const tip = () => document.querySelector<HTMLElement>('[data-slot="dica"]')

async function openWithProfile(url: string, profile: ProfileInForm) {
  const user = userEvent.setup()
  const screenHandle = openScreen(url)
  await enterProfile(user, profile, BUTTON)
  await within(profileBox()).findByText(/Seu Perfil:/)
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

it('without a Profile, nothing is marked for the reader', async () => {
  openScreen(GUIDE)
  await screen.findByRole('region', { name: FIRST })
  expect(markInText()).not.toBeVisible()
  expect(forYourProfile(FIRST)).toBeNull()
  expect(document.querySelector('[data-slot="selo-voce"]')).toBeNull()
})

it("with a Profile, the answer says its key number is the reader's, and the sentence and the Tip that cover it say so", async () => {
  await openWithProfile(GUIDE, { gender: 'homem', seeks: 'homens', age: '22' })
  expect(profileBox()).toHaveTextContent(
    'Seu Perfil: homem, procura homens, 22 anos',
  )
  expect(forYourProfile(FIRST)).toHaveTextContent(
    'vale para você o número em destaque vem de um estudo com pessoas do seu Perfil.',
  )
  // The second answer marks no number, so it has no line.
  expect(forYourProfile(SECOND)).toBeNull()
  expect(markInText()).toBeVisible()
  expect(markInText()).toHaveTextContent('vale para você')
  expect(tip()?.querySelector('[data-slot="selo-voce"]')?.textContent).toBe(
    'vale para você',
  )
})

it('the mark in the text only shows for the sample the finding covers', async () => {
  await openWithProfile(GUIDE, { gender: 'mulher', age: '30' })
  // 18 to 35 covers 30, so the key number still applies…
  expect(forYourProfile(FIRST)).toHaveTextContent('vale para você')
  // …but the sentence is about 18 to 24.
  expect(markInText()).not.toBeVisible()
})

it('"outro" only matches what did not split by gender: here, no number of the answer is the reader\'s', async () => {
  await openWithProfile(GUIDE, { gender: 'outro', seeks: 'homens' })
  expect(forYourProfile(FIRST)).toHaveTextContent(
    'Para o seu Perfil: nenhum número desta Pergunta vem de uma amostra como a sua.',
  )
  expect(tip()).toHaveTextContent('Não há dado deste estudo para o seu Perfil.')
  // The finding about ages 18 to 24 did not split by gender, and the
  // Profile has no age: it may be the reader's.
  expect(markInText()).toBeVisible()
})

it('"mudar" opens the filled-in form, and deleting goes back to the Guide without a Profile', async () => {
  const { user } = await openWithProfile(GUIDE, {
    gender: 'mulher',
    seeks: 'mulheres',
    age: '24',
  })
  expect(markInText()).toBeVisible()
  await user.click(within(profileBox()).getByRole('button', { name: 'mudar' }))
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
  expect(markInText()).not.toBeVisible()
})

it('the saved Profile is still there when the Guide opens again', async () => {
  const { unmount } = await openWithProfile(GUIDE, { gender: 'mulher' })
  unmount()

  openScreen(GUIDE)
  expect(
    await within(
      await screen.findByRole('region', { name: 'Seu Perfil' }),
    ).findByText(/Seu Perfil:/),
  ).toHaveTextContent('Seu Perfil: mulher')
})
