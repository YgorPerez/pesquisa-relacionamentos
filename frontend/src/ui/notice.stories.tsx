// The notice at the bottom of the screen (`notice.tsx`, #345) alone: a
// button that shows one, as "Comentar" does once a comment is sent.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { SiteButton } from './button'
import { Notices, useNotice } from './notice'

const MESSAGE = 'Comentário enviado. Obrigado!'

function ShowNotice() {
  const notice = useNotice()
  return <SiteButton onClick={() => notice(MESSAGE)}>Enviar</SiteButton>
}

function WithNotices() {
  return (
    <Notices>
      <ShowNotice />
    </Notices>
  )
}

const meta = {
  component: WithNotices,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WithNotices>

export default meta

type Story = StoryObj<typeof meta>

/** A notice shown: the line at the bottom of the screen. */
export const Shown: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Enviar' }),
    )
    await expect(await within(document.body).findByText(MESSAGE)).toBeVisible()
  },
}
