// Claude Code's Bash `PreToolUse` hook (`.claude/settings.json`): a command
// that changes a repository file through a Python script or `sed -i` gets a
// warning to use the Edit tool. It came from Festival dos Macacos, where some
// 20 of these patches stopped halfway or missed their anchor. The command runs
// anyway; the warning goes into the agent's context. Writing to `/tmp` does
// not warn.
//
// `sed` and `python` only count in command position, outside quotes and
// heredocs: a commit message or an `echo` that quotes `sed -i` is not a patch
// (Escala-as-Dores/festival-macacos#1432).
//
//   echo '{"tool_input":{"command":"..."}}' | node scripts/patch-warning.ts

import { readFileSync } from 'node:fs'

const OUTSIDE_REPO = /^(\/tmp\/|\$\(mktemp|\$TMPDIR|\/dev\/)/

/** Where a command starts: start, `;`, `&&`, `||`, `|`, `(`, `$(`, newline,
 * followed by environment assignments and `sudo`. */
const COMMAND_START = String.raw`(?:^|[;&|(\n]|\$\()\s*(?:[A-Za-z_]\w*=\S*\s+)*(?:sudo\s+)?`

/** The command without heredoc bodies and with each quoted span replaced by
 * `''`: only what the shell reads as command and argument is left. */
function withoutQuotedText(command: string): string {
  const lines = command.split('\n')
  const outside: string[] = []
  let end: string | null = null
  for (const line of lines) {
    if (end !== null) {
      if (line.trim() === end) end = null
      continue
    }
    outside.push(line)
    const heredoc = line.match(/<<-?\s*['"]?(\w+)['"]?/)
    if (heredoc) end = heredoc[1] ?? null
  }
  return outside.join('\n').replace(/'[^']*'|"(?:[^"\\]|\\.)*"/g, "''")
}

/** Values of simple assignments (`p='x.md'`, `p = Path("x.md")`), to know
 * where an `open(p, 'w')` goes. */
function variables(command: string): Map<string, string> {
  const values = new Map<string, string>()
  for (const match of command.matchAll(
    /\b([A-Za-z_]\w*)\s*=\s*(?:Path\(\s*)?['"]([^'"\n]+)['"]/g,
  ))
    values.set(match[1] ?? '', match[2] ?? '')
  return values
}

/** The path of a Python argument: the unquoted literal, the variable's value,
 * or its name when the value is unknown. */
function pythonPath(argument: string, values: Map<string, string>): string {
  const literal = argument.match(/^(?:Path\(\s*)?['"]([^'"]+)['"]\)?$/)
  if (literal) return literal[1] ?? ''
  return values.get(argument) ?? argument
}

/** The files of a `sed -i`: the arguments that are not options, minus the
 * script when it did not come through `-e` or `-f`. */
function sedFiles(args: string): string[] {
  const parts = args.trim().split(/\s+/)
  if (!parts.some((part) => /^(-[a-zA-Z]*i|--in-place)/.test(part))) return []
  let scriptByOption = false
  const loose: string[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] ?? ''
    if (/^-[a-zA-Z]*[ef]$/.test(part)) {
      scriptByOption = true
      i++
    } else if (!part.startsWith('-')) loose.push(part)
  }
  const files = scriptByOption ? loose : loose.slice(1)
  return files.filter(
    (file) =>
      file !== "''" && /[A-Za-z]/.test(file) && /^[\w./~$-]+$/.test(file),
  )
}

/** The files the command writes through Python or `sed -i`: the path when it
 * can be known, the variable's name when it cannot. Empty when it writes
 * nothing in the repository. */
export function scriptWrites(command: string): string[] {
  const commands = withoutQuotedText(command)
  const writes: string[] = []
  if (new RegExp(`${COMMAND_START}python3?\\b`).test(commands)) {
    const values = variables(command)
    for (const match of command.matchAll(
      /\bopen\(\s*([^,)]+?)\s*,\s*['"][wa]\+?['"]/g,
    ))
      writes.push(pythonPath(match[1] ?? '', values))
    for (const match of command.matchAll(
      /((?:Path\(\s*)?[\w.'"/]+\)?)\.write_text\(/g,
    ))
      writes.push(pythonPath(match[1] ?? '', values))
  }
  for (const match of commands.matchAll(
    new RegExp(`${COMMAND_START}sed\\s+([^;&|\\n)]*)`, 'g'),
  ))
    writes.push(...sedFiles(match[1] ?? ''))
  return writes.filter((path) => !OUTSIDE_REPO.test(path))
}

/** The warning, or `null` when the command does not write by script. */
export function patchWarning(command: string): string | null {
  const writes = scriptWrites(command)
  if (writes.length === 0) return null
  return (
    `This command changes files by script (${writes.join(', ')}). In the repository, change files with the Edit tool, ` +
    'one span per call: a patch by Python or `sed -i` misses its anchor without warning, and one that stops halfway ' +
    'leaves the change half done.'
  )
}

if (import.meta.main) {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}') as {
    tool_input?: { command?: string }
  }
  const text = patchWarning(input.tool_input?.command ?? '')
  if (text)
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: text,
        },
      }),
    )
}
