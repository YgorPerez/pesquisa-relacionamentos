// The app on the VPS, with a blue/green swap modeled on the Festival dos
// Macacos (`frontend/scripts/vps.ts` there). `deploy.yml` calls it like this:
//
//   VPS_HOST=… [VPS_USER=root] [VPS_PORT=22] [VPS_SSH_KEY=<the key, or its path>] \
//     node scripts/vps.ts --publish .output <sha>
//   … node scripts/vps.ts --rollback [<sha>]
//
// `--publish` sends the `.output`, the `Dockerfile`, the vhost and the log
// rotation (`../nginx/`), builds the `temestudo-app:sha-<sha>` image on the
// VPS and swaps the container. `--rollback` swaps to an image the VPS already
// has: the previous deploy's, without the SHA, or the requested SHA's.
//
// What each step does on the VPS is the plan (`deploy-plan.ts`, ADR 0007).
// Here lives only what follows it: over SSH, or, in `vps.test.ts`, in a bash
// with a fake docker. The log says how long each step took
// (`stopwatch.ts`, ADR 0009).
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it
// strips.

import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  emailOpcional,
  lerVariaveis,
  porta as aPort,
  usuario as aUser,
} from '../../scripts/variaveis.ts'
import { keyFile } from './ssh-key.ts'
import { stopwatch } from './stopwatch.ts'
import {
  HOST_CONFIG,
  type Step,
  publishPlan,
  rollbackPlan,
  prologue,
} from './deploy-plan.ts'

// `nginx.test.ts` checks the vhost against these.
export { HOST_CONFIG, STATS } from './deploy-plan.ts'

/** The VPS as the deploy sees it: runs a script in the app folder and
 * receives files in `envio/`. */
export type Vps = {
  run: (script: string) => string
  upload: (folder: string, names: readonly string[]) => void
}

type Target = {
  host: string
  port: string
  user: string
  key?: string
}

function options({ port, key }: Target, portFlag: '-p' | '-P') {
  return [
    portFlag,
    port,
    '-o',
    'BatchMode=yes',
    '-o',
    'StrictHostKeyChecking=accept-new',
    ...(key ? ['-i', key, '-o', 'IdentitiesOnly=yes'] : []),
  ]
}

function run(command: string, args: string[], cwd?: string, input?: string) {
  const r = spawnSync(command, args, {
    cwd,
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  })
  if (r.status !== 0)
    throw new Error(`${command} failed (exited with ${r.status}).`)
  return r.stdout
}

/** The real VPS: the script goes through `ssh`'s stdin, the files through
 * `scp`. */
function overSsh(target: Target): Vps {
  const account = `${target.user}@${target.host}`
  return {
    run: (script) =>
      run(
        'ssh',
        [...options(target, '-p'), account, 'bash -s'],
        undefined,
        `${prologue()}${script}`,
      ),
    upload: (folder, names) =>
      void run(
        'scp',
        [
          ...options(target, '-P'),
          ...names,
          `${account}:/opt/temestudo/envio/`,
        ],
        folder,
      ),
  }
}

/** Follows the plan on the VPS, step by step, with each one's time in the
 * log. */
function followThePlan({
  steps,
  vps,
  upload,
  say,
  now,
}: {
  steps: Step[]
  vps: Vps
  /** The local folder the steps' `upload` comes from. */
  upload?: string
  say: (line: string) => void
  now?: () => number
}) {
  const clock = stopwatch(say, now)
  const runAndSay = (script: string) => {
    const output = vps.run(script).trim()
    if (output) say(output)
  }
  for (const step of steps)
    clock.step(step.name, () => {
      if (!step.onFailure) {
        runAndSay(step.script)
      } else {
        // A failure here becomes a warning, and the deploy goes on.
        try {
          runAndSay(step.script)
        } catch (error) {
          say(
            `Warning: ${step.onFailure.warning} (${(error as Error).message}). The site goes on.`,
          )
          try {
            runAndSay(step.onFailure.script)
          } catch {
            say(`Warning: ${step.onFailure.warningIfFailsAgain}`)
          }
        }
      }
      if (step.upload) {
        if (!upload) throw new Error(`The ${step.name} step needs an upload.`)
        say('The build goes to the VPS.')
        vps.upload(upload, step.upload)
      }
    })
  clock.total()
}

/** Publishes the build's `.output` with the commit's SHA. Outside the test,
 * `email` comes from `GOATCOUNTER_EMAIL`. */
export function publish({
  output,
  vps,
  say,
  now,
  ...plan
}: {
  output: string
  vps: Vps
  say: (l: string) => void
  now?: () => number
} & Parameters<typeof publishPlan>[0]) {
  const steps = publishPlan(plan)
  const work = mkdtempSync(join(tmpdir(), 'publish-temestudo-'))
  try {
    // The whole `.output`: Nitro serves `public/` from Node itself, and
    // Nginx only proxies (`../nginx/temestudo.conf`).
    run('tar', ['-czf', join(work, 'build.tar.gz'), '-C', output, '.'])
    const frontend = resolve(output, '..')
    copyFileSync(join(frontend, 'Dockerfile'), join(work, 'Dockerfile'))
    for (const [name] of HOST_CONFIG)
      copyFileSync(join(frontend, 'nginx', name), join(work, name))
    followThePlan({ steps, vps, upload: work, say, now })
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

/** Rolls back to an image the VPS kept: the requested SHA's, or the previous
 * deploy's. The vhost stays as it is. */
export function rollback({
  sha,
  vps,
  say,
  now,
  paths,
}: {
  sha?: string
  vps: Vps
  say: (l: string) => void
  now?: () => number
} & Omit<Parameters<typeof rollbackPlan>[0], 'sha'>) {
  const target = sha ?? vps.run('cat anterior 2>/dev/null || true').trim()
  if (!target) throw new Error('The VPS kept no previous deploy: give the SHA.')
  const steps = rollbackPlan({ sha: target, paths })
  say(`Rolling back to sha-${target}.`)
  followThePlan({ steps, vps, say, now })
}

/** The VPS from the `VPS_*` environment variables, or none without
 * `VPS_HOST`. */
function fromCommandLine(): Target | undefined {
  const { VPS_HOST: host, VPS_SSH_KEY: key } = process.env
  if (!host) return undefined
  // Validated before the first step (ADR 0032).
  const read = lerVariaveis(
    { VPS_PORT: aPort(22), VPS_USER: aUser('root') },
    process.env,
  )
  return {
    host,
    port: String(read.VPS_PORT),
    user: read.VPS_USER,
    key: keyFile(key),
  }
}

if (import.meta.main) {
  const [mode, a, b] = process.argv.slice(2)
  const target = fromCommandLine()
  const say = (line: string) => console.log(`[vps] ${line}`)
  const usage = () => {
    console.error(
      '[vps] Usage: VPS_HOST=… [VPS_USER=root] [VPS_PORT=22] [VPS_SSH_KEY=…] node scripts/vps.ts --publish <.output> <sha> | --rollback [<sha>]',
    )
    process.exit(1)
  }
  if (!target) usage()
  else if (mode === '--publish' && a && b)
    publish({
      output: resolve(a),
      sha: b,
      // Validated before the first step (ADR 0032).
      email: lerVariaveis({ GOATCOUNTER_EMAIL: emailOpcional }, process.env)
        .GOATCOUNTER_EMAIL,
      vps: overSsh(target),
      say,
    })
  else if (mode === '--rollback')
    rollback({ sha: a, vps: overSsh(target), say })
  else usage()
}
