// What a Guide, a Tip and a Fact sheet's page mount once, after their
// `<Column>`, for the reader's actions on their text (#332): the popover on
// selected text and the layer that paints the Grifos and opens a Grifo's
// popover. Both sit inside the page's Fact sheets (`PageSources`), so "De
// onde vem isso?" is in each popover.
import type { ComponentProps } from 'react'
import { HighlightLayer } from './highlight-layer'
import { SelectionPopover } from './selection-popover'
import { PageSources } from './selection-source'

export function PageSelection(
  sources: Omit<ComponentProps<typeof PageSources>, 'children'>,
) {
  return (
    <PageSources {...sources}>
      <SelectionPopover />
      <HighlightLayer />
    </PageSources>
  )
}
