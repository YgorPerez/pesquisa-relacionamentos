// What a Guide, a Tip and a Fact sheet's page mount once, after their
// `<Column>`, for the reader's actions on their text (#332): the popover on
// selected text and the layer that paints the Grifos and opens a Grifo's
// popover.
import { HighlightLayer } from './highlight-layer'
import { SelectionPopover } from './selection-popover'

export function PageSelection() {
  return (
    <>
      <SelectionPopover />
      <HighlightLayer />
    </>
  )
}
