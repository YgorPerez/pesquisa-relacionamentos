// Copied from the Festival dos Macacos (`scripts/chave-ssh.ts`). `VPS_SSH_KEY`
// is the whole private key or the path to one. `ssh -i` only reads a file:
// the whole key goes to a `600` file in a temporary folder, which is removed
// when the process ends.
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it
// strips.

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** The path `ssh -i` receives, or `undefined` without a key. */
export function keyFile(value: string | undefined): string | undefined {
  if (!value) return undefined
  if (!value.includes('PRIVATE KEY-----')) return value
  const folder = mkdtempSync(join(tmpdir(), 'ssh-key-'))
  const file = join(folder, 'key')
  // Without the trailing newline, ssh says the key has an invalid format.
  writeFileSync(file, value.endsWith('\n') ? value : `${value}\n`, {
    mode: 0o600,
  })
  process.on('exit', () => rmSync(folder, { recursive: true, force: true }))
  return file
}
