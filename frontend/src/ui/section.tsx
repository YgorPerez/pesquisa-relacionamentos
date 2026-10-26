// The pieces inside the page (DESIGN.md, Layout and Components): the section
// with the hand-drawn rule and its title, the panel with the halftone and
// the dashed notice.
import type { ComponentProps, HTMLAttributes } from 'react'
import { cn } from '@/platform/cn'

/** The section opens with the hand-drawn rule, 20px above the title. */
export function Section({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('regua mt-secao pt-5', className)} {...props} />
}

/** A section title. */
export function Headline({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'm-0 mb-sm font-headline text-headline text-balance',
        className,
      )}
      data-slot="headline"
      {...props}
    />
  )
}

/** The DESIGN.md `painel`: a sheet with a hand outline and the halftone
 * behind, the site's only elevation. `as` is the element (the short answer
 * is a section, the Guide's Tip a list item). */
export function Panel({
  as: Element = 'div',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  return (
    <Element
      className={cn(
        'reticula rounded-mao border-2 border-tinta bg-folha px-md pt-md pb-4',
        className,
      )}
      {...props}
    />
  )
}

/** The dashed notice: the unverified Fact sheet, what is not live yet.
 * Right after a back link, it gets room above. */
export function Notice({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'm-0 mb-md rounded-mao-2 border-2 fio-tracejado border-tinta bg-folha px-md py-sm text-aviso leading-normal [[data-slot=voltar]+&]:mt-sm',
        className,
      )}
      data-slot="aviso"
      {...props}
    />
  )
}
