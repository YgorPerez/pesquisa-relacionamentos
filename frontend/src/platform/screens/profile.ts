// Entering the Profile through the "Seu Perfil" form, the way a person does:
// checks the gender and who they seek, types the age and taps the button.
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

export interface ProfileInForm {
  readonly gender?: 'homem' | 'mulher' | 'outro'
  readonly seeks?: 'homens' | 'mulheres' | 'ambos'
  readonly age?: string
}

export async function enterProfile(
  user: UserEvent,
  { gender, seeks, age }: ProfileInForm,
  button: string,
) {
  const form = within(await screen.findByRole('form', { name: 'Seu Perfil' }))
  if (gender)
    await user.click(
      within(form.getByRole('radiogroup', { name: 'Você é' })).getByRole(
        'radio',
        { name: gender },
      ),
    )
  if (seeks)
    await user.click(
      within(form.getByRole('radiogroup', { name: 'Você procura' })).getByRole(
        'radio',
        { name: seeks },
      ),
    )
  if (age !== undefined) {
    const field = form.getByLabelText('Sua idade')
    await user.clear(field)
    await user.type(field, age)
  }
  await user.click(form.getByRole('button', { name: button }))
}
