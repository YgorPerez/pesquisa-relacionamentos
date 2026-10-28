// A short line at the bottom of the screen that goes away by itself (#345):
// what an action that closes its popover tells the reader once it is done,
// like "Comentário enviado". It sits on Base UI's Toast, which reads it to
// the screen reader and holds it while the pointer is over it. A notice may
// carry a link to where the result is kept (#347: the sent comment, in
// "Seus trechos"); that one stays longer, to give time for the tap.
import { Toast } from '@base-ui/react/toast'
import { Link, type LinkProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'

/** A link under the notice's line. */
export interface NoticeLink {
  readonly to: LinkProps['to']
  readonly label: string
}

/** How long a notice with a link stays, in milliseconds; Base UI's default
 * (5 s) for one without. */
const WITH_LINK_MS = 8000

/** The notices on the screen, the last one in front. */
function NoticeList() {
  const { toasts } = Toast.useToastManager<{ link?: NoticeLink }>()
  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      data-slot="notice"
      className="flex flex-wrap items-baseline gap-x-sm rounded-mao border-2 border-tinta bg-folha px-sm py-xs"
    >
      <Toast.Title className="m-0 text-label leading-nota font-bold" />
      {toast.data?.link && (
        <Link
          to={toast.data.link.to}
          className="inline-flex min-h-toque items-center text-label leading-nota font-bold text-tinta"
        >
          {toast.data.link.label}
        </Link>
      )}
    </Toast.Root>
  ))
}

/** Where `useNotice()` puts its lines, around what calls it. */
export function Notices({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed inset-x-0 bottom-md z-40 mx-auto flex w-fit max-w-[calc(100%-2*var(--spacing-md))] flex-col gap-xs">
          <NoticeList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}

/** Shows `message` at the bottom of the screen for a few seconds, with
 * `link` under it if given. */
export function useNotice() {
  const manager = Toast.useToastManager()
  return (message: string, link?: NoticeLink) =>
    void manager.add(
      link
        ? { title: message, data: { link }, timeout: WITH_LINK_MS }
        : { title: message },
    )
}
