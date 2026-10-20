// As peças de toda página (DESIGN.md, Layout e Typography): a folha, a
// coluna de texto, o título `display` e o `lead`. Cada uma é o elemento do
// HTML com as classes do tema; quem a usa acrescenta o lugar (`className`).
// As rotas as pegam por `ui/pagina.ts`.
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
