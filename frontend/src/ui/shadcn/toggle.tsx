import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { cn } from '@/platform/cn'

/** The DESIGN.md `chip`: paper with a hand outline, yellow when pressed.
 * Unavailable (`aria-disabled`, which keeps the focus and says why), the
 * outline turns dashed and the letters faded. What came from shadcn's
 * `base-nova` was swapped for the tokens. */
function Toggle({ className, ...props }: TogglePrimitive.Props) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(
        'inline-flex min-h-toque cursor-pointer items-center gap-2 rounded-mao border-(length:--traco-controle) border-tinta bg-papel px-3.5 py-2 text-left font-label text-nota leading-tight font-bold text-tinta sem-realce-no-toque aria-disabled:cursor-not-allowed aria-disabled:fio-tracejado aria-disabled:text-tinta-2 aria-pressed:bg-amarelo-voce',
        className,
      )}
      {...props}
    />
  )
}

export { Toggle }
