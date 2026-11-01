import type { ReactNode } from 'react'

/** The browser's own checkbox: the Base UI one does not toggle without
 * JavaScript, and this is what a reader must tick before the form goes. */
export function Agreement({
  name,
  children,
}: {
  name: string
  children: ReactNode
}) {
  return (
    <label className="flex min-h-toque items-center gap-xs font-bold">
      <input
        type="checkbox"
        name={name}
        required
        className="size-5 flex-none accent-tinta"
      />
      {children}
    </label>
  )
}
