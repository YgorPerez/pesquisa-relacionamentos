import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from '@/platform/cn'

/** The DESIGN.md switch: a 46 × 26px track with a hand outline, a blob
 * thumb, and yellow when on. Forced off (the browser asks not to count), the
 * outline turns dashed. On focus, the ring is the site's, and the corner
 * stays the track's. It goes inside a `<label>`, which names it. What came
 * from shadcn's `base-nova` was swapped for the tokens. */
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
