import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { cn } from '@/platform/cn'

/** The checkbox that looks like the DESIGN.md `opcao`: the whole option is
 * the box, paper with a hand outline, yellow when checked. The text (and the
 * tick, if any) goes inside and is its name. Disabled, it fades and turns
 * dashed. With `withCheck`, it carries the drawn little square before the text.
 * What came from shadcn's `base-nova` was swapped for the tokens. */
function Checkbox({
  className,
  withCheck = false,
  ...props
}: CheckboxPrimitive.Root.Props & { withCheck?: boolean }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'inline-flex min-h-toque cursor-pointer items-center rounded-mao border-(length:--traco-controle) border-tinta bg-papel px-4 py-2.5 text-nota leading-title font-bold focus-visible:rounded-mao data-checked:bg-amarelo-voce data-disabled:cursor-not-allowed data-disabled:fio-tracejado data-disabled:opacity-55',
        withCheck && 'gap-2',
        className,
      )}
      {...props}
    />
  )
}

export { Checkbox }
