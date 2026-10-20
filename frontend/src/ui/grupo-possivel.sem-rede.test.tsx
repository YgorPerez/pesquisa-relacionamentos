// O Grupo possível sem rede, num arquivo só dele: os pacotes que chegaram
// ficam guardados no módulo (`estado/pacotes-do-grupo.ts`) até o fim do
// arquivo, e num arquivo com outros testes o pedido que este derruba já
// teria chegado antes.
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vite-plus/test'
import { abrirTela } from '#/platform/telas/abrir-tela'
import { contaNova, faixa } from '#/platform/telas/grupo-possivel'
import { dizerPerfil } from '#/platform/telas/perfil'
import { semRede } from '#/platform/telas/rede'

it('sem rede, avisa que os dados não chegaram, e tentar de novo faz a conta', async () => {
  const usuario = userEvent.setup()
  const rede = semRede()
  abrirTela('/grupo-possivel')
  await dizerPerfil(
    usuario,
    { genero: 'mulher', procura: 'homens', idade: '40' },
    'Usar na conta',
  )
  const alerta = await screen.findByRole('alert')
  expect(alerta).toHaveTextContent('Não deu para baixar os dados da conta.')
  const antes = faixa()

  rede.voltar()
  await usuario.click(
    within(alerta).getByRole('button', { name: 'Tentar de novo' }),
  )
  await contaNova(antes)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
