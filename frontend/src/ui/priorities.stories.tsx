import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { toggleInTop3 } from '@tem-estudo/rules/priorities'
import { PrioritiesCard, Top3Picker, Bookcase } from './priorities'
import { SPLIT, TRAITS } from './priorities.example'

function Calculator() {
  const [top3, setTop3] = useState<ReadonlyArray<string>>(['renda', 'sexo'])
  const [open, setOpen] = useState<string | null>(null)
  return (
    <>
      <Top3Picker
        traits={TRAITS}
        top3={top3}
        onToggle={(id) => setTop3(toggleInTop3(top3, id))}
      />
      <Bookcase
        traits={TRAITS}
        outcome="satisfacao"
        top3={top3}
        open={open}
        onOpen={setOpen}
        gender={undefined}
      />
    </>
  )
}

const meta = {
  component: Calculator,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Calculator>

export default meta

type Story = StoryObj<typeof meta>

/** The top 3 chips and the four satisfaction shelves, together as on the
 * page. */
export const ChipsAndShelves: Story = {}

/** The B1 Guide card with a chosen top 3. */
export const B1Card: Story = {
  render: () => (
    <PrioritiesCard
      split={SPLIT}
      traits={TRAITS}
      top3={['sexo', 'parecido', 'renda']}
    />
  ),
}
