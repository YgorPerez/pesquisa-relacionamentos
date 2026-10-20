// The `ui/shadcn/` controls, one per story, as Base UI draws them with the
// DESIGN.md tokens (ADR 0027). The `ui/` pieces that use them have their own
// stories; here each one shows alone, in its states.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from '@/ui/shadcn/button'
import { Checkbox } from '@/ui/shadcn/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/shadcn/collapsible'
import { Input } from '@/ui/shadcn/input'
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group'
import { Select } from '@/ui/shadcn/select'
import { Switch } from '@/ui/shadcn/switch'
import { Toggle } from '@/ui/shadcn/toggle'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Buttons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2.5">
      <Button>Usar na conta</Button>
      <Button variant="light">mudar</Button>
      <Button variant="back">Voltar para a Pergunta</Button>
      <Button variant="underlined">voltar ao texto</Button>
    </div>
  ),
}

export const Chip: Story = {
  render: function Chip() {
    const [on, setOn] = useState(false)
    return (
      <Toggle pressed={on} onPressedChange={setOn}>
        Renda
      </Toggle>
    )
  },
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole('button', { name: 'Renda' })
    await userEvent.click(chip)
    await expect(chip).toHaveAttribute('aria-pressed', 'true')
  },
}

export const Options: Story = {
  render: () => (
    <RadioGroup aria-label="Você procura" defaultValue="mulheres">
      <RadioGroupItem value="homens">homens</RadioGroupItem>
      <RadioGroupItem value="mulheres">mulheres</RadioGroupItem>
      <RadioGroupItem value="ambos">ambos</RadioGroupItem>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await userEvent.click(screen.getByRole('radio', { name: 'ambos' }))
    await expect(screen.getByRole('radio', { name: 'ambos' })).toBeChecked()
  },
}

export const Checkboxes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2.5">
      <Checkbox defaultChecked>preta</Checkbox>
      <Checkbox withCheck>Só quem não fuma</Checkbox>
      <Checkbox withCheck disabled>
        Só quem não tem filhos
      </Checkbox>
    </div>
  ),
}

export const OnOffSwitch: Story = {
  render: () => (
    <label className="inline-flex min-h-toque items-center gap-2.5 font-bold">
      <Switch defaultChecked />
      Contar minhas visitas
    </label>
  ),
}

export const Fields: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <Input type="number" aria-label="Sua idade" defaultValue={30} />
      <Input
        small
        readOnly
        aria-label="Link"
        value="https://temestudo.cloud/"
      />
    </div>
  ),
}

export const Fold: Story = {
  render: () => (
    <div className="flex flex-col gap-md">
      <Collapsible>
        <CollapsibleTrigger>De onde vem a incerteza</CollapsibleTrigger>
        <CollapsibleContent>
          <p>Cada Requisito vem de uma pesquisa com a sua margem.</p>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible variant="solid" defaultOpen>
        <CollapsibleTrigger variant="solid">
          Antes: o parceiro explica pouco da satisfação
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p>A maior parte vem da relação.</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await userEvent.click(
      screen.getByRole('button', { name: 'De onde vem a incerteza' }),
    )
    await expect(
      screen.getByText('Cada Requisito vem de uma pesquisa com a sua margem.'),
    ).toBeVisible()
  },
}

const STATES = [
  { value: null, label: 'Brasil inteiro' },
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'SP', label: 'São Paulo' },
]

export const List: Story = {
  render: () => (
    <div className="flex flex-col gap-md">
      <Select label="Estado" items={STATES} defaultValue={null} />
      <Select
        label="Município"
        items={[{ value: null, label: 'Carregando os municípios…' }]}
        defaultValue={null}
        disabled
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    const state = screen.getByRole('combobox', { name: 'Estado' })
    await userEvent.click(state)
    // The list opens in a portal, outside the canvas.
    await userEvent.click(
      await within(document.body).findByRole('option', { name: 'Alagoas' }),
    )
    await expect(state).toHaveTextContent('Alagoas')
    await expect(
      screen.getByRole('combobox', { name: 'Município' }),
    ).toBeDisabled()
  },
}
