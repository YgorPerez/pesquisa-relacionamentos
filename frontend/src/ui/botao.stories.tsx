import type { Meta, StoryObj } from '@storybook/react-vite'
import { Botao } from './botao'

const meta = {
  component: Botao,
  args: { children: 'Ver o que vale para você' },
} satisfies Meta<typeof Botao>

export default meta

type Story = StoryObj<typeof meta>

export const Principal: Story = {}

export const Leve: Story = {
  args: { variante: 'leve', children: 'mudar' },
}
