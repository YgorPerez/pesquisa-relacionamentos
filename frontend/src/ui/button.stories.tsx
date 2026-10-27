import type { Meta, StoryObj } from '@storybook/react-vite'
import { SiteButton } from './button'
import { ActionButton } from './selection-button'

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

/** The button of an action in the popover on selected text: the light one. */
export const SelectionAction: Story = {
  render: () => <ActionButton>De onde vem isso?</ActionButton>,
}
