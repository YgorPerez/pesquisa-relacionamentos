import type { Meta, StoryObj } from '@storybook/react-vite'
import { SiteButton } from './button'
import { Field, FieldForm } from './field'

const meta = {
  component: Field,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Field>
export default meta
type Story = StoryObj<typeof meta>
export const InAForm: Story = {
  args: { id: 'email', label: 'E-mail', name: 'email', type: 'email' },
  render: (args) => (
    <FieldForm action="#">
      <Field {...args} />
      <SiteButton type="submit">Enviar</SiteButton>
    </FieldForm>
  ),
}
