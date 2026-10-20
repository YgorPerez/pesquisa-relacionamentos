import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import { killTree, spawnWithGroup, withTimeout } from './kill-tree.ts'

const FOLDER = mkdtempSync(join(tmpdir(), 'kill-tree-'))
afterAll(() => rmSync(FOLDER, { recursive: true, force: true }))
let n = 0

/** A child like the one `dev.ts` spawns: in a shell, with a grandchild doing
 * the work (the `; true` keeps the shell from becoming the grandchild). The
 * grandchild writes its PID to a file, so the test can see whether it died
 * too. Stdout does not work: under `vp run --cache`, the grandchild's output
 * does not come through the pipe. */
function child(seconds: number, prefix = '') {
  const file = join(FOLDER, `grandchild-${++n}`)
  const c = spawnWithGroup(
    `${prefix}${JSON.stringify(process.execPath)} -e "require('node:fs').writeFileSync('${file}', String(process.pid)); setTimeout(() => {}, ${seconds * 1000})"; true`,
    { stdio: 'ignore' },
  )
  return Object.assign(c, { file })
}

const end = (c: ReturnType<typeof child>) =>
  new Promise<number | null>((resolve) =>
    c.on('close', (code) => resolve(code)),
  )

/** The PID the grandchild wrote. */
async function grandchildPid(c: ReturnType<typeof child>) {
  await expect.poll(() => existsSync(c.file), { timeout: 4000 }).toBe(true)
  await expect
    .poll(() => readFileSync(c.file, 'utf8'), { timeout: 1000 })
    .toMatch(/^\d+$/)
  return Number(readFileSync(c.file, 'utf8'))
}

function alive(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

describe('killTree', () => {
  it('stops the child and the grandchild the shell spawned', async () => {
    const c = child(60)
    const grandchild = await grandchildPid(c)
    expect(alive(grandchild)).toBe(true)
    killTree(c)
    await end(c)
    await expect.poll(() => alive(grandchild)).toBe(false)
  })

  // `vp dev` puts Vite in a process group of its own: the signal to the
  // child's group does not reach it, and the parent PID does.
  it.skipIf(process.platform === 'win32')(
    'also stops a grandchild that opened a group of its own',
    async () => {
      const c = child(60, 'setsid ')
      const grandchild = await grandchildPid(c)
      killTree(c)
      await end(c)
      await expect.poll(() => alive(grandchild)).toBe(false)
    },
  )

  it('does not touch a process it did not spawn', async () => {
    // A process from another session, outside the child's group.
    const other = spawn(
      process.execPath,
      ['-e', 'setTimeout(() => {}, 60000)'],
      {
        stdio: 'ignore',
      },
    )
    const c = child(60)
    await grandchildPid(c)
    killTree(c)
    await end(c)
    expect(alive(other.pid!)).toBe(true)
    other.kill()
  })

  it('leaves a child that already exited as it is', async () => {
    const c = child(0)
    expect(await end(c)).toBe(0)
    expect(() => killTree(c)).not.toThrow()
  })
})

describe('withTimeout', () => {
  it('stops what runs past the timeout, with its tree, and reports it', async () => {
    const c = child(60)
    let reported = false
    withTimeout(c, 200, () => {
      reported = true
    })
    const start = Date.now()
    expect(await end(c)).not.toBe(0)
    expect(reported).toBe(true)
    expect(Date.now() - start).toBeLessThan(10_000)
  })

  it('does not stop what finishes in time, and does not report', async () => {
    const c = child(0)
    let reported = false
    withTimeout(c, 5_000, () => {
      reported = true
    })
    expect(await end(c)).toBe(0)
    expect(reported).toBe(false)
  })
})
