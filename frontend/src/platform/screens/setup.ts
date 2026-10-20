// What every `.test.tsx` needs before opening a screen in jsdom (ADR 0031):
// the jest-dom matchers (`toBeVisible`, `toHaveAccessibleName`…), the fake
// network on (`./network.ts`), and the screen unmounted and the device
// cleaned after each test. Testing Library only unmounts on its own with
// Vitest's globals on, and here they are not.
//
// An error or warning in the console fails the test, as in the stories:
// React warns that way about a repeated key, a forgotten `act`, badly nested
// HTML.
import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import {
  afterAll,
  afterEach,
  beforeEach,
  vi,
  type MockInstance,
} from 'vite-plus/test'
import { server } from './network'

// `findBy*` and `waitFor` give up after 10 s, and not 1: a file's first
// screen compiles the route inside that wait. A wait that finds what it
// looks for does not take longer because of it. That is also why
// `vi.waitFor`, which gives up after 1 s, does not go into a screen test
// (`frontend/lint/no-vi-waitfor-in-screens.ts`).
configure({ asyncUtilTimeout: 10_000 })

server.listen({ onUnhandledFrame: 'error' })

// jsdom does not scroll: a page that opens at the top would call a
// `scrollTo` it only announces as "not implemented".
let spies: MockInstance[] = []
beforeEach(() => {
  window.scrollTo = () => {}
  spies = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
  sessionStorage.clear()
  const said = spies.flatMap((spy) =>
    spy.mock.calls.map((call) => call.map(String).join(' ')),
  )
  vi.restoreAllMocks()
  if (said.length > 0)
    throw new Error(`the screen wrote to the console:\n${said.join('\n')}`)
})

afterAll(() => server.close())
