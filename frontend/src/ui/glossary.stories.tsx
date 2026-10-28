// The Glossário's entries (`glossary.tsx`), over the fixture's Verbetes
// (`term-popover.example.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TERMS } from './term-popover.example'
import { Glossary } from './glossary'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** An institution with its Study, and a Verbete each Study defines. */
export const Entries: Story = {
  render: () => <Glossary terms={TERMS} />,
}

/** Before the first Verbete. */
export const Empty: Story = {
  render: () => <Glossary terms={[]} />,
}
