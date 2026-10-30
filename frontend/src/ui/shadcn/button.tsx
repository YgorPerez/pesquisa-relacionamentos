import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/platform/cn'

// The DESIGN.md button (`botao` and `botao-leve`): hand outline, 44px tall,
// the `label` letters, and it rises 1px on hover. The `primary` one is yellow
// with the halftone behind; the `light` one is paper, without halftone, for
// actions such as "mudar". The `back` one is the DESIGN.md back link, bold
// with the arrow and no box, on the link and on the button. The `underlined`
// one is the action in running text, without a box ("voltar ao texto"). The
// `arrow` shape is the link that leads to a calculator, with the text and the
// arrow side by side. The `icon` one is a drawn icon alone, which carries
// its name in `aria-label`. What came from shadcn's `base-nova` was swapped for the
// tokens.
const BOX =
  'rounded-mao border-(length:--traco-controle) border-tinta px-4 py-2.5 font-label text-label text-tinta hover:-translate-y-px active:translate-y-px motion-reduce:hover:translate-none motion-reduce:active:translate-none'
const NO_BOX =
  'inline-flex items-center border-0 bg-transparent text-left font-label text-inherit'

const buttonVariants = cva('min-h-toque cursor-pointer', {
  variants: {
    variant: {
      primary: [BOX, 'reticula bg-amarelo-voce'],
      light: [BOX, 'bg-folha'],
      back: [
        NO_BOX,
        'mt-sm gap-2 p-0 text-aviso font-bold no-underline hover:underline',
      ],
      underlined: [
        NO_BOX,
        'px-0 py-1 text-label leading-body underline decoration-(length:--traco-etiqueta) underline-offset-4',
      ],
      // A big number that opens its detail, in a table's cell: dotted under.
      number: [
        NO_BOX,
        'rounded-mao-2 p-0 text-right font-title text-grande leading-tight font-bold underline decoration-dotted decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta',
      ],
      // Only a drawn icon, in a 44px square: the × of "Continuar lendo".
      icon: [
        NO_BOX,
        'size-toque flex-none justify-center p-0 text-tinta-2 hover:text-tinta',
      ],
    },
    shape: {
      text: '',
      arrow: 'inline-flex items-center gap-2.5 no-underline',
    },
  },
  defaultVariants: { variant: 'primary', shape: 'text' },
})

function Button({
  className,
  variant,
  shape,
  type = 'button',
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const classes = cn(buttonVariants({ variant, shape }), className)
  if (nativeButton === false) {
    return <LinkLookingLikeButton {...props} className={classes} />
  }
  return (
    <ButtonPrimitive
      data-slot="button"
      type={type}
      className={classes}
      {...props}
    />
  )
}

/** The `nativeButton={false}` here is always a link (`render={<Link />}`),
 * and it only takes the button's look. The Base UI `Button` gives
 * `role="button"` to every element that is not a `<button>`, and the screen
 * reader would announce "botão" where the tap navigates (the same as in
 * Festival dos Macacos). */
function LinkLookingLikeButton({ render, ...props }: ButtonPrimitive.Props) {
  return useRender({
    render: render as useRender.RenderProp,
    props: { 'data-slot': 'button', ...props },
  })
}

export { Button }
