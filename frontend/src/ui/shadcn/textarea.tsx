import type * as React from 'react'
import { cn } from '@/platform/cn'

/** The DESIGN.md `campo` for free text, like the Comentário's: the same
 * paper and hand outline as `Input`, in body-sized letters, the full width
 * of its box. shadcn's `textarea` is a plain `<textarea>`, and Base UI has
 * none; its classes were swapped for the tokens.
 *
 * It grows with what is typed instead of showing the browser's resize grip:
 * on a phone, a finger scrolling the sheet caught the grip and dragged the
 * field to a column one syllable wide. */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'field-sizing-content min-h-24 w-full resize-none rounded-mao-2 border-(length:--traco-controle) border-tinta bg-papel px-2.5 py-1.5 font-body text-nota leading-body text-tinta',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
