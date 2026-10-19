import { Input as InputPrimitive } from '@base-ui/react/input'
import type * as React from 'react'
import { cn } from '@/platform/cn'

/** O `campo` do DESIGN.md: papel, contorno de mão, 44px de altura, o número
 * em 18px negrito. Quem usa decide a largura e, no link para copiar, a letra
 * menor (`texto`). O que veio do `base-nova` do shadcn foi trocado pelos
 * tokens. */
function Input({
  className,
  texto = false,
  ...props
}: React.ComponentProps<'input'> & { texto?: boolean }) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        'min-h-toque w-26 rounded-mao-2 border-(length:--traco-controle) border-tinta bg-papel px-2.5 py-1.5 font-body font-bold text-tinta',
        texto ? 'text-nota font-normal' : 'text-grande',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
