// As peças de dentro da página (DESIGN.md, Layout e Components): a seção com
// a régua à mão e o título dela, o painel com a retícula e o aviso
// tracejado.
import type { ComponentProps, HTMLAttributes } from 'react'
import { cn } from '@/platform/cn'

/** A seção abre com a régua desenhada à mão, 20px acima do título. */
export function Secao({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('regua mt-secao pt-5', className)} {...props} />
}

/** O título de uma seção. */
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

/** O `painel` do DESIGN.md: folha com contorno de mão e a retícula atrás,
 * a única elevação do site. `como` é o elemento (a resposta curta é uma
 * seção, a Dica do Guia um item de lista). */
export function Painel({
  como: Elemento = 'div',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  como?: 'div' | 'section' | 'article' | 'li'
}) {
  return (
    <Elemento
      className={cn(
        'reticula rounded-mao border-2 border-tinta bg-folha px-md pt-md pb-4',
        className,
      )}
      {...props}
    />
  )
}

/** O aviso tracejado: a Ficha não verificada, o que ainda não entrou no ar.
 * Logo depois de um voltar, ganha ar em cima. */
export function Aviso({ className, ...props }: ComponentProps<'p'>) {
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
