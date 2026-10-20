// The sidebar search looks in the titles, which come from the file path
// (`ui/possible-group.stories.tsx` becomes `ui/possible-group`) and so have no
// accents: `possíble` would find nothing. Here what is typed loses its accent
// before the search reads it, and `possíble` looks for `possible`. Copied
// from the Festival dos Macacos `manager.ts` (ADR 0037).
//
// The field is React's, through the Downshift of Storybook's `Search.tsx`.
// This listener sits on `document`, in the capture phase, and runs before
// React's, which sits on the root. The new value goes in through the
// `HTMLInputElement` setter, and not through `field.value`: React watches the
// element's `value`, and with the value swapped that way it would think
// nothing changed and the search would keep the accent.
//
// The test is `search.e2e.ts`, against the real Storybook: an upgrade that
// swaps the field breaks the test, and not the search silently.

const FIELD = 'storybook-explorer-searchfield'

/** The `HTMLInputElement` setter, called with the field as `this`. */
const write = (field: HTMLInputElement, value: string) =>
  Reflect.set(HTMLInputElement.prototype, 'value', value, field)

const withoutAccent = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '')

/** Removes the accent from the field and leaves the cursor where it was.
 * Says whether anything changed. */
function removeAccent(field: HTMLInputElement) {
  const value = field.value
  const clean = withoutAccent(value)
  if (clean === value) return false
  const before = value.slice(0, field.selectionStart ?? value.length)
  const cursor = withoutAccent(before).length
  write(field, clean)
  field.setSelectionRange(cursor, cursor)
  return true
}

const searchField = (event: Event) =>
  event.target instanceof HTMLInputElement && event.target.id === FIELD
    ? event.target
    : undefined

document.addEventListener(
  'input',
  (event) => {
    const field = searchField(event)
    // In the middle of a composition (a dead-key accent, an IME), swapping
    // the value undoes what is being composed. Wait for the end, below.
    if (field && !(event as InputEvent).isComposing) removeAccent(field)
  },
  true,
)

// Chrome does not send `input` after the composition ends, so this one tells
// React about the new value.
document.addEventListener(
  'compositionend',
  (event) => {
    const field = searchField(event)
    if (field && removeAccent(field))
      field.dispatchEvent(new Event('input', { bubbles: true }))
  },
  true,
)
