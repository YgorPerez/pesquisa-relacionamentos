// The app server's environment variables (ADR 0032), as the Festival dos
// Macacos keeps its server's in one module: each one is a key here, typed
// by the repository's `scripts/env.ts`, the only place this app reaches for
// it. Read on each call, so a variable set while the server runs counts.
//
// Server only: a server function imports it inside its handler, which the
// browser bundle drops (`content/comment.ts`).
import {
  optionalSecret,
  optionalText,
  readEnv,
  text,
} from '../../../scripts/env.ts'

export const serverEnv = () =>
  readEnv(
    {
      // The site's own address (ADR 0045): the login's redirect and where a
      // write may come from. Without it, login stays off.
      APP_ORIGIN: optionalText,
      // The app's SQLite file (ADR 0044). `database.ts` does not read it: that
      // file also runs alone, in plain node, in the image's maintenance script.
      DATABASE_PATH: text('/data/app.sqlite'),
      GOOGLE_CLIENT_ID: optionalText,
      GOOGLE_CLIENT_SECRET: optionalSecret,
      // The token that opens a Comentário's issue (ADR 0043); without it, no
      // comment goes out.
      COMMENT_GITHUB_TOKEN: optionalSecret,
      // The curator's Google subject (ADR 0047); without it, `/curadoria`
      // shows nothing to anyone and no curator action runs.
      CURATOR_GOOGLE_SUB: optionalSecret,
    },
    process.env,
  )
