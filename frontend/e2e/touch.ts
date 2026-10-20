// The suite runs on mobile and on desktop (`playwright.config.ts`). On mobile
// the test taps, like the visitor; on desktop, which has no touch, it clicks.
import { test, type Locator } from '@playwright/test'

type Options = Parameters<Locator['tap']>[0]

/** Taps on mobile and clicks on desktop. */
export async function tap(target: Locator, options?: Options): Promise<void> {
  if (test.info().project.use.hasTouch) await target.tap(options)
  else await target.click(options)
}

/** Opens the list of the `Select` named `label` inside `area` and taps the
 * option `option`. The list opens in a portal, outside `area`. */
export async function choose(
  area: Locator,
  label: string,
  option: string,
): Promise<void> {
  await tap(area.getByRole('combobox', { name: label }))
  await tap(area.page().getByRole('option', { name: option, exact: true }))
}
