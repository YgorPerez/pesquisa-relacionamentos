import type { Meta, StoryObj } from '@storybook/react-vite'
import { NotaValePara } from './perfil'

const meta = {
  component: NotaValePara,
  parameters: { layout: 'padded' },
  args: { texto: 'homens e mulheres, de 18 a 35 anos.', veredito: null },
} satisfies Meta<typeof NotaValePara>

export default meta

type Story = StoryObj<typeof meta>

/** Sem Perfil: só a nota da amostra. */
export const SemPerfil: Story = {}

/** O achado cobre o Perfil: selo amarelo, e a nota continua. */
export const ValeParaVoce: Story = { args: { veredito: { cobre: true } } }

/** Quem procura ambos e só um lado tem dado. */
export const SoUmLado: Story = {
  args: { veredito: { cobre: true, so: 'mulheres' } },
}

/** O achado não cobre: anel vazio e a frase em negrito, sem rosa. */
export const SemDado: Story = {
  args: { texto: 'casais homem-mulher.', veredito: { cobre: false } },
}
