// As peças de toda página (DESIGN.md, Layout e Typography): a folha, a
// coluna de texto, o título `display`, o `lead`, a seção com a régua à mão e
// o título dela, e o aviso tracejado. Cada uma é o elemento do HTML com as
// classes do tema; quem a usa acrescenta o lugar (`className`).
import type { ComponentProps } from 'react'
import { cn } from '@/platform/cn'

/** A página: uma coluna no celular; a partir de 900px, a folha com contorno
 * sobre a retícula do fundo. */
export function Folha({ className, ...props }: ComponentProps<'main'>) {
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

/** A medida do texto. */
export function Coluna({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('max-w-texto', className)} {...props} />
}

/** O título da página. `ficha` é o menor, da Ficha e da Dica. */
export function Display({
  className,
  ficha = false,
  ...props
}: ComponentProps<'h1'> & { ficha?: boolean }) {
  return (
    <h1
      className={cn(
        'font-display text-balance',
        ficha ? 'my-sm text-display-ficha' : 'mt-6.5 mb-5.5 text-display',
        className,
      )}
      {...props}
    />
  )
}

export function Lead({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('m-0 text-lead', className)} {...props} />
}

/** A seção abre com a régua desenhada à mão, 20px acima do título. */
export function Secao({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section className={cn('regua mt-secao pt-5', className)} {...props} />
  )
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
