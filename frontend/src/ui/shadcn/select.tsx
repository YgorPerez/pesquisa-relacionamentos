import { Select as SelectPrimitive } from '@base-ui/react/select'
import { cn } from '@/platform/cn'

type Option<Value> = { readonly value: Value; readonly label: string }

/** The pick-one list, with the label on top: paper with a hand outline, one
 * tap tall, and the option under the finger or the keyboard in yellow.
 * Disabled, it fades and turns dashed. It is the Base UI `Select`, which
 * gives the trigger the `combobox` role, the list the `listbox` one, the
 * first-letter search and the arrows; the label names it. The option with
 * value `null` clears the choice ("Brasil inteiro"). What came from shadcn's
 * `base-nova` was swapped for the tokens. */
function Select<Value>({
  label,
  items,
  className,
  ...props
}: Omit<SelectPrimitive.Root.Props<Value>, 'items' | 'multiple'> & {
  /** The name shown on top, which the screen reader reads. */
  label: string
  items: readonly Option<Value>[]
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
            <Arrow />
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
              {items.map((option) => (
                <SelectPrimitive.Item
                  key={String(option.value)}
                  value={option.value}
                  className="flex min-h-toque cursor-pointer items-center px-2.5 py-1.5 font-body text-medio font-bold data-highlighted:bg-amarelo-voce data-selected:underline"
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
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

const Arrow = () => (
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
