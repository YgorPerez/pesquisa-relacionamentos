// The app server's environment variables (ADR 0032), as the Festival dos
// Macacos keeps its server's in one module: each one is a key here, typed
// by the repository's `scripts/env.ts`, the only place this app reaches for
// it. Read on each call, so a variable set while the server runs counts.
//
// Server only: a server function imports it inside its handler, which the
// browser bundle drops (`content/comment.ts`).
import { optionalSecret, readEnv } from '../../../scripts/env.ts'

export const serverEnv = () =>
  readEnv(
    {
      // The token that opens a Comentário's issue (ADR 0043); without it, no
      // comment goes out.
      COMMENT_GITHUB_TOKEN: optionalSecret,
    },
    process.env,
  )
