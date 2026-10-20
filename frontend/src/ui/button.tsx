import type { ComponentProps } from 'react'
import { Button } from '@/ui/shadcn/button'

type Props = ComponentProps<typeof Button> & {
  /** `primary` is yellow with the halftone behind; `light` is paper, without
   * halftone, for actions such as "mudar". */
  variant?: 'primary' | 'light'
}

/** The DESIGN.md button: hand outline, 44px tall, rises 1px on hover. The
 * drawing lives in the `Button` of `ui/shadcn/button.tsx`. */
export function SiteButton({ variant = 'primary', ...props }: Props) {
  return <Button variant={variant} {...props} />
}
