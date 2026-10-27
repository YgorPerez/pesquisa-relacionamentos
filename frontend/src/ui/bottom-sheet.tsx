// A sheet that rises from the bottom of the screen (#345), for a form typed
// on a phone: the Comentário opens here on touch instead of in the popover
// on selected text, where the keyboard leaves the popover a few lines of
// room. It sits on Base UI's Drawer, whose keyboard provider sets
// `--drawer-keyboard-inset` to the keyboard's height while one is open: the
// sheet stands on it, and its body scrolls under a title that stays.
import { Drawer } from '@base-ui/react/drawer'
import type { ReactNode } from 'react'
import { SiteButton } from './button'
import { CLOSE } from './bottom-sheet.copy'

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <Drawer.VirtualKeyboardProvider>
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-30 bg-tinta/20" />
          <Drawer.Viewport className="fixed inset-x-0 top-0 bottom-[var(--drawer-keyboard-inset,0px)] z-30 flex items-end justify-center">
            <Drawer.Popup
              data-slot="bottom-sheet"
              className="flex max-h-full w-full max-w-texto flex-col rounded-t-mao border-2 border-b-0 border-tinta bg-papel outline-none"
            >
              <div className="flex shrink-0 items-center justify-between gap-xs border-b-2 border-tinta px-sm py-xs">
                <Drawer.Title className="m-0 text-label leading-nota font-bold">
                  {title}
                </Drawer.Title>
                <Drawer.Close render={<SiteButton variant="light" />}>
                  {CLOSE}
                </Drawer.Close>
              </div>
              <Drawer.Content className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-sm pt-xs pb-md">
                {children}
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.VirtualKeyboardProvider>
    </Drawer.Root>
  )
}
