// Dizer o Perfil pelo formulário "Seu Perfil", como a pessoa diz: marca
// gênero e quem procura, digita a idade e toca no botão.
import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

export interface PerfilNoForm {
  readonly genero?: 'homem' | 'mulher' | 'outro'
  readonly procura?: 'homens' | 'mulheres' | 'ambos'
  readonly idade?: string
}

export async function dizerPerfil(
  usuario: UserEvent,
  { genero, procura, idade }: PerfilNoForm,
  botao: string,
) {
  const form = within(await screen.findByRole('form', { name: 'Seu Perfil' }))
  if (genero)
    await usuario.click(
      within(form.getByRole('radiogroup', { name: 'Você é' })).getByRole(
        'radio',
        { name: genero },
      ),
    )
  if (procura)
    await usuario.click(
      within(form.getByRole('radiogroup', { name: 'Você procura' })).getByRole(
        'radio',
        { name: procura },
      ),
    )
  if (idade !== undefined) {
    const campo = form.getByLabelText('Sua idade')
    await usuario.clear(campo)
    await usuario.type(campo, idade)
  }
  await usuario.click(form.getByRole('button', { name: botao }))
}
