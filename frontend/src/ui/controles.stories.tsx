// Os controles de `ui/shadcn/`, um por story, como o Base UI os desenha com
// os tokens do DESIGN.md (ADR 0027). As peças de `ui/` que os usam têm as
// suas próprias stories; aqui cada um aparece sozinho, nos estados dele.
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

export const Botoes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2.5">
      <Button>Usar na conta</Button>
      <Button variant="leve">mudar</Button>
    </div>
  ),
}

export const Chip: Story = {
  render: function Chip() {
    const [ligado, setLigado] = useState(false)
    return (
      <Toggle pressed={ligado} onPressedChange={setLigado}>
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

export const Opcoes: Story = {
  render: () => (
    <RadioGroup aria-label="Você procura" defaultValue="mulheres">
      <RadioGroupItem value="homens">homens</RadioGroupItem>
      <RadioGroupItem value="mulheres">mulheres</RadioGroupItem>
      <RadioGroupItem value="ambos">ambos</RadioGroupItem>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    await userEvent.click(tela.getByRole('radio', { name: 'ambos' }))
    await expect(tela.getByRole('radio', { name: 'ambos' })).toBeChecked()
  },
}

export const Caixas: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2.5">
      <Checkbox defaultChecked>preta</Checkbox>
      <Checkbox visto>Só quem não fuma</Checkbox>
      <Checkbox visto disabled>
        Só quem não tem filhos
      </Checkbox>
    </div>
  ),
}

export const Chave: Story = {
  render: () => (
    <label className="inline-flex min-h-toque items-center gap-2.5 font-bold">
      <Switch defaultChecked />
      Contar minhas visitas
    </label>
  ),
}

export const Campos: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <Input type="number" aria-label="Sua idade" defaultValue={30} />
      <Input texto readOnly aria-label="Link" value="https://temestudo.com/" />
    </div>
  ),
}

export const Recolhivel: Story = {
  render: () => (
    <div className="flex flex-col gap-md">
      <Collapsible>
        <CollapsibleTrigger>De onde vem a incerteza</CollapsibleTrigger>
        <CollapsibleContent>
          <p>Cada Requisito vem de uma pesquisa com a sua margem.</p>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible variante="cheia" defaultOpen>
        <CollapsibleTrigger variante="cheia">
          Antes: o parceiro explica pouco da satisfação
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p>A maior parte vem da relação.</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    await userEvent.click(
      tela.getByRole('button', { name: 'De onde vem a incerteza' }),
    )
    await expect(
      tela.getByText('Cada Requisito vem de uma pesquisa com a sua margem.'),
    ).toBeVisible()
  },
}

const ESTADOS = [
  { value: null, label: 'Brasil inteiro' },
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'SP', label: 'São Paulo' },
]

export const Lista: Story = {
  render: () => (
    <div className="flex flex-col gap-md">
      <Select label="Estado" items={ESTADOS} defaultValue={null} />
      <Select
        label="Município"
        items={[{ value: null, label: 'Carregando os municípios…' }]}
        defaultValue={null}
        disabled
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const estado = tela.getByRole('combobox', { name: 'Estado' })
    await userEvent.click(estado)
    // A lista abre num portal, fora do canvas.
    await userEvent.click(
      await within(document.body).findByRole('option', { name: 'Alagoas' }),
    )
    await expect(estado).toHaveTextContent('Alagoas')
    await expect(
      tela.getByRole('combobox', { name: 'Município' }),
    ).toBeDisabled()
  },
}
