// The Readings (`readings.tsx`), over the fixture's Neighbor sites
// (`readings.example.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { READINGS } from './readings.example'
import { FurtherReading, ReadingList } from './readings'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** One Topic's Readings on `/sites-vizinhos`: Portuguese first, each with
 * its site, its line and its notices. */
export const List: Story = {
  render: () => <ReadingList readings={READINGS} />,
}

/** "Para ler além daqui", the end of a Guide's text. */
export const AtTheEndOfTheGuide: Story = {
  render: () => <FurtherReading readings={READINGS} />,
}
