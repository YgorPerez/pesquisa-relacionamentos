import type { ComponentProps } from 'react'
import { Button } from '@/ui/shadcn/button'

type Props = ComponentProps<typeof Button> & {
  /** `principal` é amarelo com a retícula atrás; `leve` é folha, sem
   * retícula, para ações como "mudar". */
  variante?: 'principal' | 'leve'
}

/** O botão do DESIGN.md: contorno de mão, 44px de altura, sobe 1px no hover.
 * O desenho mora no `Button` de `ui/shadcn/button.tsx`. */
export function Botao({ variante = 'principal', ...props }: Props) {
  return <Button variant={variante} {...props} />
}
