import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { cn } from '@/platform/cn'

/** As opções lado a lado, que quebram a linha quando não cabem. */
function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    />
  )
}

/** A `opcao` do DESIGN.md: a opção inteira é o rádio, papel com contorno de
 * mão, e amarela quando marcada. O texto vai dentro (`children`) e é o nome
 * dela. O que veio do `base-nova` do shadcn (a bolinha ao lado do texto) foi
 * trocado pelo desenho do site. */
function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <span className="relative">
      <RadioPrimitive.Root
        data-slot="radio-group-item"
        className={cn(
          'inline-flex min-h-toque cursor-pointer items-center rounded-mao border-(length:--traco-controle) border-tinta bg-papel px-4 py-2.5 text-nota leading-title font-bold focus-visible:rounded-mao data-checked:bg-amarelo-voce',
          className,
        )}
        {...props}
      />
    </span>
  )
}

export { RadioGroup, RadioGroupItem }
