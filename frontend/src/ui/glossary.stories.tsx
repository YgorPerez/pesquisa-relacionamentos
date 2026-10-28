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

/** The reader came from a text's "Ver no Glossário": the loop around
 * satisfação and "voltar ao texto" (#358). */
export const CameFromText: Story = {
  render: () => (
    <Glossary
      terms={TERMS}
      cameFrom={{ slug: 'satisfacao', backToText: () => {} }}
    />
  ),
}

/** Before the first Verbete. */
export const Empty: Story = {
  render: () => <Glossary terms={[]} />,
}
