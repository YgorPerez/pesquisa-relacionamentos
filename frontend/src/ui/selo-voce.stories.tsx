import type { Meta, StoryObj } from '@storybook/react-vite'
import { SeloVoce } from './perfil'

const meta = {
  component: SeloVoce,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SeloVoce>

export default meta

type Story = StoryObj<typeof meta>

/** O selo amarelo do achado que cobre o Perfil. */
export const ValeParaVoce: Story = {}

/** Quem procura homens e mulheres, e só um lado tem dado. */
export const SoMulheres: Story = { args: { so: 'mulheres' } }

export const SoHomens: Story = { args: { so: 'homens' } }
