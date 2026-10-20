import { Select as SelectPrimitive } from '@base-ui/react/select'
import { cn } from '@/platform/cn'

type Opcao<Valor> = { readonly value: Valor; readonly label: string }

/** A lista de escolher uma opção, com o rótulo em cima: papel com contorno de
 * mão, do tamanho de um toque, e a opção sob o dedo ou o teclado em amarelo.
 * Desligada, apaga e fica tracejada. É o `Select` do Base UI, que dá o papel
 * `combobox` ao gatilho, o `listbox` à lista, a busca pela primeira letra e as
 * setas; o rótulo dá o nome a ele. A opção de valor `null` é a que limpa a
 * escolha ("Brasil inteiro"). O que veio do `base-nova` do shadcn foi trocado
 * pelos tokens. */
function Select<Valor>({
  label,
  items,
  className,
  ...props
}: Omit<SelectPrimitive.Root.Props<Valor>, 'items' | 'multiple'> & {
  /** O nome que aparece em cima e que o leitor de tela lê. */
  label: string
  items: readonly Opcao<Valor>[]
  className?: string
}) {
  return (
    <SelectPrimitive.Root items={items} {...props}>
      <div data-slot="select" className={cn('grid gap-1.5', className)}>
        <SelectPrimitive.Label className="block text-nota font-bold">
          {label}
        </SelectPrimitive.Label>
        <SelectPrimitive.Trigger className="flex min-h-toque w-full max-w-88 cursor-pointer items-center justify-between gap-2 rounded-mao-2 border-(length:--traco-controle) border-tinta bg-papel px-2.5 py-1.5 text-left font-body text-medio font-bold text-tinta data-disabled:cursor-not-allowed data-disabled:fio-tracejado data-disabled:text-tinta-2">
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon className="flex shrink-0">
            <Seta />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
      </div>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          className="z-10"
          alignItemWithTrigger={false}
          sideOffset={4}
        >
          <SelectPrimitive.Popup className="max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto rounded-mao-2 border-(length:--traco-controle) border-tinta bg-papel py-1 text-tinta">
            <SelectPrimitive.List>
              {items.map((opcao) => (
                <SelectPrimitive.Item
                  key={String(opcao.value)}
                  value={opcao.value}
                  className="flex min-h-toque cursor-pointer items-center px-2.5 py-1.5 font-body text-medio font-bold data-highlighted:bg-amarelo-voce data-selected:underline"
                >
                  <SelectPrimitive.ItemText>
                    {opcao.label}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

const Seta = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3.5 6.2c1.6 1.4 3 2.9 4.6 4.3 1.4-1.5 2.9-2.9 4.4-4.4" />
  </svg>
)

export { Select }
