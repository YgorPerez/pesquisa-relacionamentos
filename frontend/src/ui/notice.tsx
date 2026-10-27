// A short line at the bottom of the screen that goes away by itself (#345):
// what an action that closes its popover tells the reader once it is done,
// like "Comentário enviado". It sits on Base UI's Toast, which reads it to
// the screen reader and holds it while the pointer is over it.
import { Toast } from '@base-ui/react/toast'
import type { ReactNode } from 'react'

/** The notices on the screen, the last one in front. */
function NoticeList() {
  const { toasts } = Toast.useToastManager()
  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      data-slot="notice"
      className="rounded-mao border-2 border-tinta bg-folha px-sm py-xs"
    >
      <Toast.Title className="m-0 text-label leading-nota font-bold" />
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

/** Shows `message` at the bottom of the screen for a few seconds. */
export function useNotice() {
  const manager = Toast.useToastManager()
  return (message: string) => void manager.add({ title: message })
}
