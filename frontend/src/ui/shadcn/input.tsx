import { Input as InputPrimitive } from '@base-ui/react/input'
import type * as React from 'react'
import { cn } from '@/platform/cn'

/** The DESIGN.md `campo`: paper, hand outline, 44px tall, the number in
 * bold 18px. The caller decides the width and, in the link to copy, the
 * smaller letters (`small`). What came from shadcn's `base-nova` was swapped
 * for the tokens. */
function Input({
  className,
  small = false,
  ...props
}: React.ComponentProps<'input'> & { small?: boolean }) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        'min-h-toque w-26 rounded-mao-2 border-(length:--traco-controle) border-tinta bg-papel px-2.5 py-1.5 font-body font-bold text-tinta',
        small ? 'text-nota font-normal' : 'text-grande',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
