import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConfiancaDaResposta } from './guia'

const meta = {
  component: ConfiancaDaResposta,
  parameters: { layout: 'padded' },
  args: { confianca: 'moderada' },
} satisfies Meta<typeof ConfiancaDaResposta>

export default meta

type Story = StoryObj<typeof meta>

/** Os degraus de 72px ao lado do rótulo, como no topo da resposta curta. */
export const Moderada: Story = {}

export const Forte: Story = { args: { confianca: 'forte' } }

export const Fraca: Story = { args: { confianca: 'fraca' } }
