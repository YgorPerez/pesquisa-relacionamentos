import type { Meta, StoryObj } from '@storybook/react-vite'
import { Agreement } from './agreement'

const meta = { component: Agreement } satisfies Meta<typeof Agreement>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: { name: 'adult', children: 'Declaro ter 18 anos ou mais' },
}
