import type { ComponentProps } from 'react'

type Props = ComponentProps<'button'> & {
  /** `principal` é amarelo com a retícula atrás; `leve` é folha, sem
   * retícula, para ações como "mudar". */
  variante?: 'principal' | 'leve'
}

/** O botão do DESIGN.md: contorno de mão, 44px de altura, sobe 1px no hover. */
export function Botao({ variante = 'principal', className, type = 'button', ...props }: Props) {
  const classes = [
    'botao',
    variante === 'principal' ? 'com-reticula' : 'botao-leve',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <button type={type} className={classes} {...props} />
}
