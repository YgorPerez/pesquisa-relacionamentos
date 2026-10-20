// The React Doctor exceptions, each one tied to the listed files and with the
// reason, as in the Festival dos Macacos (ADR 0005). A new file that falls
// into one of these rules fails the gate like any other. A new exception
// waits for a person to read it, like a suppression (ADR 0017 here, which
// came from the Festival's ADR-0036:
// https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0036-a-new-suppression-waits-for-a-person.md).

import { defineConfig } from 'react-doctor/api'

export default defineConfig({
  ignore: {
    // The build is not source code, and the e2e redoes it while the doctor
    // runs.
    files: ['.output/**', 'storybook-static/**'],
    overrides: [
      {
        // `Html` is the only place in the app that injects HTML, and it only
        // accepts the `SafeHtml` type, which no string becomes without going
        // through the filter: what the server built with `marked` from the
        // library's Markdown (`estudos/`, `dicas/`, the Guides). The input is
        // sanitized in `src/content/safe-html.ts`, which `html` and
        // `inlineHtml` from `src/content/view.ts` go through: a closed list of
        // tags and attributes, `href` only http(s), an anchor or a relative
        // path. Nothing the visitor types or that comes in the URL gets here.
        rules: ['react-doctor/dangerous-html-sink'],
        files: ['src/ui/guide.tsx'],
      },
    ],
  },
})
