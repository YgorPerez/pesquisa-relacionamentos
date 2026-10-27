// "Copiar" and "Copiar link" of the popover on selected text (#333). Each
// puts its value on the clipboard and says so; when the browser refuses the
// clipboard, the value shows up in a field to copy by hand, like
// "Compartilhar" (`share.tsx`). The count carries the action's name only.
import { Input } from '@/ui/shadcn/input'
import type { ActionOnQuote } from './selection-action'
import { ActionButton } from './selection-button'
import { countSelection } from './selection-count'
import {
  ACTION_LABEL,
  COPIED,
  COPY_BY_HAND,
  COPY_FAILED,
} from './selection-popover.copy'
import { PopoverLine } from './text-popover'

type CopyKind = 'copy' | 'link'

function CopyButton({
  kind,
  value,
  show,
}: {
  kind: CopyKind
  value: string
  show: ActionOnQuote['show']
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
  return <ActionButton onClick={copy}>{ACTION_LABEL[kind]}</ActionButton>
}

/** How the copy went, told to the screen reader; if it failed, the value in
 * a field to copy by hand. */
function CopyOutcome({ kind, failed }: { kind: CopyKind; failed?: string }) {
  return (
    <>
      <PopoverLine role="status">
        {failed === undefined ? COPIED[kind] : COPY_FAILED[kind]}
      </PopoverLine>
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
export function CopyText({ quote, show }: ActionOnQuote) {
  return <CopyButton kind="copy" value={quote.text} show={show} />
}

/** "Copiar link": the address that opens the page on the selection. */
export function CopyLink({ quote, show }: ActionOnQuote) {
  return <CopyButton kind="link" value={quote.link} show={show} />
}
