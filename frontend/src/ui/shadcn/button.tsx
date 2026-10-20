import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/platform/cn'

// O botão do DESIGN.md (`botao` e `botao-leve`): contorno de mão, 44px de
// altura, a letra do `label`, e sobe 1px no hover. O `principal` é amarelo
// com a retícula atrás; o `leve` é folha, sem retícula, para ações como
// "mudar". O `voltar` é o voltar do DESIGN.md, negrito com a seta e sem
// caixa, no link e no botão. O `sublinhado` é a ação em texto corrido, sem
// caixa ("voltar ao texto"). A forma `seta` é o link que leva a uma
// calculadora, com o texto e a seta lado a lado. O que veio do `base-nova` do
// shadcn foi trocado pelos tokens.
const CAIXA =
  'rounded-mao border-(length:--traco-controle) border-tinta px-4 py-2.5 font-label text-label text-tinta hover:-translate-y-px active:translate-y-px motion-reduce:hover:translate-none motion-reduce:active:translate-none'
const SEM_CAIXA =
  'inline-flex items-center border-0 bg-transparent text-left font-label text-inherit'

const buttonVariants = cva('min-h-toque cursor-pointer', {
  variants: {
    variant: {
      principal: [CAIXA, 'reticula bg-amarelo-voce'],
      leve: [CAIXA, 'bg-folha'],
      voltar: [
        SEM_CAIXA,
        'mt-sm gap-2 p-0 text-aviso font-bold no-underline hover:underline',
      ],
      sublinhado: [
        SEM_CAIXA,
        'px-0 py-1 text-label leading-body underline decoration-(length:--traco-etiqueta) underline-offset-4',
      ],
    },
    forma: {
      texto: '',
      seta: 'inline-flex items-center gap-2.5 no-underline',
    },
  },
  defaultVariants: { variant: 'principal', forma: 'texto' },
})

function Button({
  className,
  variant,
  forma,
  type = 'button',
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const classe = cn(buttonVariants({ variant, forma }), className)
  if (nativeButton === false) {
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
function LinkComCaraDeBotao({ render, ...props }: ButtonPrimitive.Props) {
  return useRender({
    render: render as useRender.RenderProp,
    props: { 'data-slot': 'button', ...props },
  })
}

export { Button }
