import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/platform/cn'

// O botão do DESIGN.md (`botao` e `botao-leve`): contorno de mão, 44px de
// altura, a letra do `label`, e sobe 1px no hover. O `principal` é amarelo
// com a retícula atrás; o `leve` é folha, sem retícula, para ações como
// "mudar". O que veio do `base-nova` do shadcn foi trocado pelos tokens.
const buttonVariants = cva(
  'min-h-toque cursor-pointer rounded-mao border-(length:--traco-controle) border-tinta px-4 py-2.5 font-label text-label text-tinta hover:-translate-y-px active:translate-y-px motion-reduce:hover:translate-none motion-reduce:active:translate-none',
  {
    variants: {
      variant: {
        principal: 'reticula bg-amarelo-voce',
        leve: 'bg-folha',
      },
    },
    defaultVariants: { variant: 'principal' },
  },
)

function Button({
  className,
  variant,
  type = 'button',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const classe = cn(buttonVariants({ variant }), className)
  if (props.nativeButton === false) {
    return <LinkComCaraDeBotao {...props} className={classe} />
  }
  return (
    <ButtonPrimitive
      data-slot="button"
      type={type}
      className={classe}
      {...props}
    />
  )
}

/** O `nativeButton={false}` daqui é sempre um link (`render={<Link />}`), e
 * ele só pega a cara do botão. O `Button` do Base UI dá `role="button"` a
 * todo elemento que não é `<button>`, e o leitor de tela anunciaria "botão"
 * onde o toque navega (o mesmo do Festival dos Macacos). */
function LinkComCaraDeBotao({
  render,
  nativeButton: _,
  ...props
}: ButtonPrimitive.Props) {
  return useRender({
    render: render as useRender.RenderProp,
    props: { 'data-slot': 'button', ...props },
  })
}

export { Button }
