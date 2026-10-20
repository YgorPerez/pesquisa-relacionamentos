import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { cn } from '@/platform/cn'

/** The options side by side, wrapping when they do not fit. */
function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    />
  )
}

/** The DESIGN.md `opcao`: the whole option is the radio, paper with a hand
 * outline, and yellow when checked. The text goes inside (`children`) and is
 * its name. What came from shadcn's `base-nova` (the dot beside the text)
 * was swapped for the site's drawing. */
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
