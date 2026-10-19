import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { cn } from '@/platform/cn'

/** A caixa de marcar com cara de `opcao` do DESIGN.md: a opção inteira é a
 * caixa, papel com contorno de mão, amarela quando marcada. O texto (e o
 * visto, se houver) vai dentro e é o nome dela. Desligada, apaga e fica
 * tracejada. Com `visto`, leva o quadradinho desenhado antes do texto. O que
 * veio do `base-nova` do shadcn foi trocado pelos tokens. */
function Checkbox({
  className,
  visto = false,
  ...props
}: CheckboxPrimitive.Root.Props & { visto?: boolean }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'inline-flex min-h-toque cursor-pointer items-center rounded-mao border-(length:--traco-controle) border-tinta bg-papel px-4 py-2.5 text-nota leading-title font-bold focus-visible:rounded-mao data-checked:bg-amarelo-voce data-disabled:cursor-not-allowed data-disabled:fio-tracejado data-disabled:opacity-55',
        visto && 'gap-2',
        className,
      )}
      {...props}
    />
  )
}

export { Checkbox }
