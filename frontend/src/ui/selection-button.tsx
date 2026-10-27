// The button of an action in the popover on selected text (#332): the light
// `SiteButton`. The actions draw theirs through here, so `button.tsx` gets
// one importer for the popover however many actions there are.
import type { ComponentProps } from 'react'
import { SiteButton } from './button'

export function ActionButton(
  props: Omit<ComponentProps<typeof SiteButton>, 'variant'>,
) {
  return <SiteButton variant="light" {...props} />
}
