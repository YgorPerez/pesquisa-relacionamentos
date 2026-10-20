import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import screens from './no-vi-waitfor-in-screens.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
})

tester.run(
  'screens/no-vi-waitfor-in-screens',
  screens.rules['no-vi-waitfor-in-screens'],
  {
    valid: [
      // Testing Library's wait, which gives up after 10 s.
      'await waitFor(() => expect(x).toBe(1))',
      'await screen.findByRole("alert")',
      // Other `vi.*` pass.
      'vi.spyOn(console, "error")',
      'other.waitFor(() => {})',
    ],
    invalid: [
      {
        code: 'await vi.waitFor(() => expect(x).toBe(1))',
        errors: [{ messageId: 'shortWait' }],
      },
      {
        code: 'await vi.waitFor(async () => {}, { timeout: 500 })',
        errors: [{ messageId: 'shortWait' }],
      },
    ],
  },
)
