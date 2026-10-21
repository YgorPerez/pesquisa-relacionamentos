// The page pieces (`sheet.tsx`) and the section pieces (`section.tsx`): the
// sheet, the column, the big title, the lead, the section with its title,
// the panel and the notice.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Column, Display, Sheet, Lead } from './sheet'
import { Notice, Headline, Panel, Section } from './section'

const meta = {
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const OnePage: Story = {
  render: () => (
    <Sheet>
      <Column>
        <Display>
          Quantas pessoas atendem ao que você{' '}
          <span className="marca-texto">procura</span>?
        </Display>
        <Lead>Diga quem você procura e veja quantas pessoas sobram.</Lead>
        <Notice role="note">
          Só um destes estudos inclui o Brasil, entre os 43 países que cobre; os
          outros vêm sobretudo dos EUA e da Europa.
        </Notice>
        <Section aria-labelledby="t-exemplo">
          <Headline id="t-exemplo">Do Guia</Headline>
          <Panel>
            <p className="m-0">Que características preveem uma boa relação?</p>
          </Panel>
        </Section>
      </Column>
    </Sheet>
  ),
}
