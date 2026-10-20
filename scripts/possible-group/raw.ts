// The raw IBGE files: downloads them once to a cache outside the repository
// and reads from inside the zips without extracting them to disk.
import { spawn } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, renameSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream as WebReadableStream } from 'node:stream/web'

/** `RAW_DIR` moves it; the default stays outside the repository. */
export const RAW_DIR =
  process.env.RAW_DIR ?? join(homedir(), '.cache', 'tem-estudo', 'brutos')

export const FTP = 'https://ftp.ibge.gov.br'

/** Downloads `url` to `target` unless it is already there. */
export async function download(url: string, target: string): Promise<string> {
  if (existsSync(target)) return target
  mkdirSync(dirname(target), { recursive: true })
  console.log(`downloading ${url}`)
  const response = await fetch(url)
  if (!response.ok || !response.body)
    throw new Error(`${url} answered ${response.status}`)
  const partial = `${target}.partial`
  await pipeline(
    Readable.fromWeb(response.body as WebReadableStream),
    createWriteStream(partial),
  )
  renameSync(partial, target)
  return target
}

/** Lists the names of the files inside a zip (`unzip -Z1`). */
export async function zipEntries(zip: string): Promise<string[]> {
  const names: string[] = []
  for await (const line of commandLines('unzip', ['-Z1', zip])) names.push(line)
  return names
}

/** The lines of a file inside the zip, in latin1 (IBGE's encoding). */
export function zipLines(zip: string, file: string): AsyncIterable<string> {
  return commandLines('unzip', ['-p', zip, file], 'latin1')
}

async function* commandLines(
  command: string,
  args: string[],
  encoding: BufferEncoding = 'utf8',
): AsyncGenerator<string> {
  const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'inherit'] })
  child.stdout.setEncoding(encoding)
  const done = new Promise<number>((resolve) =>
    child.on('close', (code) => resolve(code ?? 1)),
  )
  for await (const line of createInterface({
    input: child.stdout,
    crlfDelay: Infinity,
  }))
    yield line
  const code = await done
  if (code !== 0)
    throw new Error(`${command} ${args.join(' ')} exited with ${code}`)
}
