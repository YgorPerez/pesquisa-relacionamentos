// The consent for the sensitive Requirements (`share-consent.tsx`), as it
// shows above "Copiar link". What the box changes in the link belongs to the
// screen test (`share-consent.test.tsx`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { SensitiveConsent } from './share-consent'

const meta = {
  component: SensitiveConsent,
  parameters: { layout: 'padded' },
  args: {
    sensitive: ['bisexual'],
    checked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof SensitiveConsent>

export default meta

type Story = StoryObj<typeof meta>

/** One sensitive Requirement on, not yet consented: it stays out. */
export const Unchecked: Story = {}

/** All four on, and the visitor agreed: they go in the link. */
export const AllFourChecked: Story = {
  args: {
    sensitive: ['obesity', 'depression', 'bisexual', 'worship'],
    checked: true,
  },
}
