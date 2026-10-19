import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from '@/platform/cn'

/** A chave do DESIGN.md: trilho de 46 × 26px com contorno de mão, polegar
 * de bolota, e o amarelo quando ligada. Desligada à força (o navegador pede
 * para não contar), o contorno fica tracejado. No foco, o anel é o do site,
 * e o canto continua o do trilho. Vai dentro de um `<label>`, que lhe dá o
 * nome. O que veio do `base-nova` do shadcn foi trocado pelos tokens. */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'relative h-6.5 w-11.5 flex-none rounded-trilho border-(length:--traco-controle) border-tinta bg-papel focus-visible:rounded-trilho data-checked:bg-amarelo-voce data-disabled:fio-tracejado',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="absolute top-0.75 left-0.75 size-4.25 rounded-bolota border-(length:--traco-controle) border-tinta bg-folha transition-transform duration-150 ease-out data-checked:translate-x-4.75 motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
