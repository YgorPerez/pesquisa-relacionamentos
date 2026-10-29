// A reference ring's popover (`reference-popover.tsx`) over the fixture's
// Guide (`guide.example.ts`): a paragraph as the server draws it, with two
// rings. The play taps the second, which marks the sentence since the first
// and opens Costa's Fact sheet next to the ring.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { excerpt, GUIDE } from './guide.example'
import { Html } from './html'
import { ReferencePopover } from './reference-popover'
import { OPEN_FACT_SHEET } from './reference-popover.copy'

const [SILVA, COSTA] = GUIDE.factSheets

function Paragraph() {
  return (
    <main>
      <Html
        as="p"
        className="prosa max-w-140"
        html={excerpt(
          `No Brasil, ==18%== dos casais se conheceram por app [@${SILVA!.slug}]. A diferença de satisfação entre app e presencial é pequena [@${COSTA!.slug}].`,
          [SILVA!, COSTA!],
        )}
      />
      <ReferencePopover factSheets={GUIDE.factSheets} />
    </main>
  )
}

const meta = {
  component: Paragraph,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Paragraph>

export default meta

type Story = StoryObj<typeof meta>

/** Before the tap: the rings in the paragraph. */
export const Rings: Story = {}

/** After a tap on the second ring. */
export const Opened: Story = {
  play: async ({ canvasElement }) => {
    const ring = within(canvasElement).getByRole('link', { name: /^Ficha 2:/ })
    await userEvent.click(ring)
    const popover = within(
      await within(document.body).findByRole('dialog', { name: /^Ficha 2:/ }),
    )
    await expect(
      popover.getByRole('link', { name: OPEN_FACT_SHEET }),
    ).toHaveAttribute('href', `/estudos/${COSTA!.slug}`)
  },
}
