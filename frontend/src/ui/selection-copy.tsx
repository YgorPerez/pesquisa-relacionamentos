// "Copiar" and "Copiar link" of the popover on selected text (#333). Each
// puts its value on the clipboard and says so; when the browser refuses the
// clipboard, the value shows up in a field to copy by hand, like
// "Compartilhar" (`share.tsx`). The count carries the action's name only.
import { Input } from '@/ui/shadcn/input'
import { SiteButton } from './button'
import type { SelectionActionProps } from './selection-action'
import { countSelection } from './selection-count'
import {
  ACTION_LABEL,
  COPIED,
  COPY_BY_HAND,
  COPY_FAILED,
} from './selection-popover.copy'

type CopyKind = 'copy' | 'link'

function CopyButton({
  kind,
  value,
  show,
}: {
  kind: CopyKind
  value: string
  show: SelectionActionProps['show']
}) {
  const copy = async () => {
    countSelection(kind)
    try {
      await navigator.clipboard.writeText(value)
      show(<CopyOutcome kind={kind} />)
    } catch {
      show(<CopyOutcome kind={kind} failed={value} />)
    }
  }
  return (
    <SiteButton variant="light" onClick={copy}>
      {ACTION_LABEL[kind]}
    </SiteButton>
  )
}

/** How the copy went, told to the screen reader; if it failed, the value in
 * a field to copy by hand. */
function CopyOutcome({ kind, failed }: { kind: CopyKind; failed?: string }) {
  return (
    <>
      <p
        role="status"
        className="m-0 text-label leading-nota font-normal text-tinta-2"
      >
        {failed === undefined ? COPIED[kind] : COPY_FAILED[kind]}
      </p>
      {failed !== undefined && (
        <Input
          small
          className="mt-xs w-full"
          readOnly
          value={failed}
          aria-label={COPY_BY_HAND[kind]}
          onFocus={(e) => e.currentTarget.select()}
          autoFocus
        />
      )}
    </>
  )
}

/** "Copiar": the selected text, nothing appended. */
export function CopyText({ quote, show }: SelectionActionProps) {
  return <CopyButton kind="copy" value={quote.text} show={show} />
}

/** "Copiar link": the address that opens the page on the selection. */
export function CopyLink({ quote, show }: SelectionActionProps) {
  return <CopyButton kind="link" value={quote.link} show={show} />
}
