// The sheet both popovers over the text wear (`text-popover.tsx`): one
// hangs under a sentence, with a panel taller than the screen has room for.
// The row stays and the panel scrolls; the real popovers are
// `selection-popover.stories.tsx` and `highlight.stories.tsx`.
import { Popover } from '@base-ui/react/popover'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, within } from 'storybook/test'
import { PopoverLine, PopoverPanel, TextPopover } from './text-popover'

const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto.'

const LINES = Array.from(
  { length: 40 },
  (_, i) => `Linha ${i + 1} de um painel comprido.`,
)

/** A sentence, with the popover open under it. */
function TallPanel() {
  const [sentence, setSentence] = useState<HTMLParagraphElement | null>(null)
  const range = (() => {
    if (!sentence) return null
    const r = document.createRange()
    r.selectNodeContents(sentence)
    return r
  })()
  return (
    <>
      <p ref={setSentence} className="mt-24 max-w-texto">
        {SENTENCE}
      </p>
      {range && (
        <Popover.Root open>
          <TextPopover
            range={range}
            side="bottom"
            sideOffset={8}
            aria-label="Popover"
          >
            <PopoverLine>A linha de cima fica.</PopoverLine>
            <PopoverPanel>
              {LINES.map((line) => (
                <PopoverLine key={line}>{line}</PopoverLine>
              ))}
            </PopoverPanel>
          </TextPopover>
        </Popover.Root>
      )}
    </>
  )
}

const meta = {
  component: TallPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TallPanel>

export default meta

type Story = StoryObj<typeof meta>

/** A panel taller than the screen: it scrolls inside the popover, which
 * ends inside the screen. */
export const TallerThanTheScreen: Story = {
  play: async () => {
    const popover = await within(document.body).findByRole('dialog', {
      name: 'Popover',
    })
    await expect(popover.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      window.innerHeight,
    )
    await expect(
      within(popover).getByText('A linha de cima fica.'),
    ).toBeVisible()
  },
}
