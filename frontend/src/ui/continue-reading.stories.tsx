// "Continuar lendo" (`continue-reading.tsx`), the home page's block of the
// Guides in progress.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { ContinueReading, type ReadingItem } from './continue-reading'
import { forget } from './continue-reading.copy'

const ITEMS: ReadonlyArray<ReadingItem> = [
  {
    topic: 'onde-conhecer-pessoas',
    title: 'Onde conhecer pessoas',
    place: {
      chapter: 'ninguem-mediu-a-sua-chance-em-cada-caminho',
      chapterTitle: 'Ninguém mediu a sua chance em cada caminho',
      chapterNumber: 2,
      chapters: 5,
      paragraph: null,
      progress: 0.27,
      at: 2,
    },
  },
  {
    topic: 'manter-a-relacao',
    title: 'Manter a relação',
    place: {
      chapter: 'o-que-preve-um-termino',
      chapterTitle: 'O que prevê um término',
      chapterNumber: 4,
      chapters: 4,
      paragraph: null,
      progress: 0.86,
      at: 1,
    },
  },
]

/** With the × working, as on the home page. */
function Forgetting({ items }: { items: ReadonlyArray<ReadingItem> }) {
  const [left, setLeft] = useState(items)
  return (
    <ContinueReading
      items={left}
      onForget={(topic) =>
        setLeft((now) => now.filter((i) => i.topic !== topic))
      }
    />
  )
}

const meta = {
  component: Forgetting,
  parameters: { layout: 'padded' },
  args: { items: ITEMS },
} satisfies Meta<typeof Forgetting>

export default meta

type Story = StoryObj<typeof meta>

/** Two Guides in progress, the most recent first. */
export const TwoGuides: Story = {}

/** One Guide, barely started. */
export const JustStarted: Story = {
  args: {
    items: [{ ...ITEMS[0]!, place: { ...ITEMS[0]!.place, progress: 0.04 } }],
  },
}

/** The × forgets a Guide; with the last one gone, the block goes too. */
export const ForgetAll: Story = {
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await userEvent.click(
      screen.getByRole('button', { name: forget('Onde conhecer pessoas') }),
    )
    await expect(screen.getAllByRole('listitem')).toHaveLength(1)
    await userEvent.click(
      screen.getByRole('button', { name: forget('Manter a relação') }),
    )
    await expect(screen.queryByRole('region')).toBeNull()
  },
}
