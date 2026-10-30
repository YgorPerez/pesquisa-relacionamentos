import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import type { ReactNode } from 'react'
import { cn } from '@/platform/cn'

/** The chip's box and letters, with or without its outline. */
const BOX =
  'inline-flex min-h-toque items-center gap-2 border-(length:--traco-controle) px-3.5 py-2 font-label text-nota leading-tight font-bold'

/** The DESIGN.md `chip`: paper with a hand outline, yellow when pressed.
 * Unavailable (`aria-disabled`, which keeps the focus and says why), the
 * outline turns dashed and the letters faded. What came from shadcn's
 * `base-nova` was swapped for the tokens. */
function Toggle({ className, ...props }: TogglePrimitive.Props) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(
        BOX,
        'cursor-pointer rounded-mao border-tinta bg-papel text-left text-tinta sem-realce-no-toque aria-disabled:cursor-not-allowed aria-disabled:fio-tracejado aria-disabled:text-tinta-2 aria-pressed:bg-amarelo-voce',
        className,
      )}
      {...props}
    />
  )
}

/** A chip's words before the page's JS: the same box with no outline, so
 * nothing moves when the `Toggle` replaces them. */
function ToggleWords({ children }: { children: ReactNode }) {
  return <span className={cn(BOX, 'border-transparent')}>{children}</span>
}

export { Toggle, ToggleWords }
