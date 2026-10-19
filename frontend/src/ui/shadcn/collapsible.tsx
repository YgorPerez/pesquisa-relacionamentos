import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { cn } from '@/platform/cn'

// A dobra do DESIGN.md: um título que abre e fecha o que vem embaixo. A
// `pontilhada` abre com o fio pontilhado e a setinha que gira (Prioridades,
// "Antes: o parceiro explica pouco"); a `cheia` abre com o fio grosso e o
// título em `title` (a conta do Grupo possível). O que veio do `base-nova` do
// shadcn não tinha desenho; o daqui é o do site.

type Variante = 'pontilhada' | 'cheia'

const RAIZ: Record<Variante, string> = {
  pontilhada: 'border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta',
  cheia: 'border-t-2 border-tinta',
}

const TITULO: Record<Variante, string> = {
  pontilhada: 'min-h-12 gap-2.5 py-2 font-bold',
  cheia: 'min-h-toque py-0 font-title text-grande font-bold',
}

function Collapsible({
  className,
  variante = 'pontilhada',
  ...props
}: CollapsiblePrimitive.Root.Props & { variante?: Variante }) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      className={cn(RAIZ[variante], className)}
      {...props}
    />
  )
}

/** O título da dobra, que é o botão. A setinha dentro dele gira quando a
 * dobra abre (`group-data-panel-open:rotate-90`). */
function CollapsibleTrigger({
  className,
  variante = 'pontilhada',
  ...props
}: CollapsiblePrimitive.Trigger.Props & { variante?: Variante }) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        'group flex w-full cursor-pointer items-center border-0 bg-transparent px-0 text-left',
        TITULO[variante],
        className,
      )}
      {...props}
    />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
