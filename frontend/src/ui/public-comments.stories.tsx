import type { Meta, StoryObj } from '@storybook/react-vite'
import { PublicComments } from './public-comments'
const meta = {
  component: PublicComments,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PublicComments>
export default meta
type Story = StoryObj<typeof meta>
export const Conversation: Story = {
  args: {
    path: '/dicas/exemplo',
    comments: [
      {
        id: 1,
        parentId: null,
        quote: 'O lugar quase não muda a relação.',
        body: 'Isso vale para quem mora no interior?',
        nickname: 'Leitora',
        edited: true,
        createdAt: 1,
        own: false,
        changed: true,
      },
      {
        id: 2,
        parentId: 1,
        quote: 'O lugar quase não muda a relação.',
        body: 'Também fiquei com essa dúvida.',
        nickname: 'Outro leitor',
        edited: false,
        createdAt: 2,
        own: false,
      },
    ],
  },
}
