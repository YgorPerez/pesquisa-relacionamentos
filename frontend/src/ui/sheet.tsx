// The pieces of every page (DESIGN.md, Layout and Typography): the sheet,
// the text column, the `display` title and the `lead`. Each is the HTML
// element with the theme classes; the caller adds the placement
// (`className`).
import type { ComponentProps } from 'react'
import { cn } from '@/platform/cn'

/** The page: one column on the phone; from 900px on, the outlined sheet
 * over the background halftone. */
export function Sheet({ className, ...props }: ComponentProps<'main'>) {
  return (
    <main
      className={cn(
        'isolate mx-auto max-w-pagina px-md pt-0 pb-rodape folha:border-2 folha:border-t-0 folha:border-tinta folha:bg-papel folha:px-16 folha:pt-3 folha:pb-14',
        className,
      )}
      {...props}
    />
  )
}

/** The text measure. */
export function Column({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('max-w-texto', className)} {...props} />
}

/** The page title. `small` is the smaller one, for the Fact sheet and the
 * Tip. */
export function Display({
  className,
  small = false,
  ...props
}: ComponentProps<'h1'> & { small?: boolean }) {
  return (
    <h1
      className={cn(
        'font-display text-balance',
        small ? 'my-sm text-display-ficha' : 'mt-6.5 mb-5.5 text-display',
        className,
      )}
      {...props}
    />
  )
}

export function Lead({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('m-0 text-lead', className)} {...props} />
}
