import { RuleTester } from 'vite-plus/lint/plugins-dev'
import { describe, it } from 'vite-plus/test'
import telas from './sem-vi-waitfor-nas-telas.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'tsx' } },
})

tester.run(
  'telas/sem-vi-waitfor-nas-telas',
  telas.rules['sem-vi-waitfor-nas-telas'],
  {
    valid: [
      // A espera da Testing Library, que desiste em 10 s.
      'await waitFor(() => expect(x).toBe(1))',
      'await screen.findByRole("alert")',
      // Outros `vi.*` passam.
      'vi.spyOn(console, "error")',
      'outro.waitFor(() => {})',
    ],
    invalid: [
      {
        code: 'await vi.waitFor(() => expect(x).toBe(1))',
        errors: [{ messageId: 'esperaCurta' }],
      },
      {
        code: 'await vi.waitFor(async () => {}, { timeout: 500 })',
        errors: [{ messageId: 'esperaCurta' }],
      },
    ],
  },
)
