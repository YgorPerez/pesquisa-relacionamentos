import type { Meta, StoryObj } from '@storybook/react-vite'
import { SiteButton } from './button'

const meta = {
  component: SiteButton,
  args: { children: 'Ver o que vale para você' },
} satisfies Meta<typeof SiteButton>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Light: Story = {
  args: { variant: 'light', children: 'mudar' },
}
