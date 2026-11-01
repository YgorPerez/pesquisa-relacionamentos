// `/curadoria` (`curator.tsx`). Deciding, which reaches the server, is the jsdom
// test's and `e2e/curator.e2e.ts`'s.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CuratorPage } from './curator'
import { CURATOR_DESK } from './curator.example'

const meta = {
  component: CuratorPage,
  parameters: { layout: 'fullscreen' },
  args: { onChanged: () => {} },
} satisfies Meta<typeof CuratorPage>
export default meta
type Story = StoryObj<typeof meta>

export const Desk: Story = { args: { desk: CURATOR_DESK } }
export const Empty: Story = {
  args: { desk: { pending: [], recent: [], before: null } },
}
export const Denied: Story = { args: { desk: null } }
