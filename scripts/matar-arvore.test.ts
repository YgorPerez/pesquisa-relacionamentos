import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import { comLimite, matar, subirComGrupo } from './matar-arvore.ts'

const PASTA = mkdtempSync(join(tmpdir(), 'matar-arvore-'))
afterAll(() => rmSync(PASTA, { recursive: true, force: true }))
let n = 0

/** Um filho como o `dev.ts` sobe: num shell, com um neto que faz o trabalho
 * (o `; true` impede o shell de virar o neto). O neto grava o PID dele num
 * arquivo, para o teste ver se ele morreu junto. O stdout não serve: sob o
 * `vp run --cache`, a saída do neto não chega pelo pipe. */
function filho(segundos: number, prefixo = '') {
  const arquivo = join(PASTA, `neto-${++n}`)
  const f = subirComGrupo(
    `${prefixo}${JSON.stringify(process.execPath)} -e "require('node:fs').writeFileSync('${arquivo}', String(process.pid)); setTimeout(() => {}, ${segundos * 1000})"; true`,
    { stdio: 'ignore' },
  )
  return Object.assign(f, { arquivo })
}

const fim = (f: ReturnType<typeof filho>) =>
  new Promise<number | null>((resolver) =>
    f.on('close', (codigo) => resolver(codigo)),
  )

/** O PID que o neto gravou. */
async function pidDoNeto(f: ReturnType<typeof filho>) {
  await expect.poll(() => existsSync(f.arquivo), { timeout: 4000 }).toBe(true)
  await expect
    .poll(() => readFileSync(f.arquivo, 'utf8'), { timeout: 1000 })
    .toMatch(/^\d+$/)
  return Number(readFileSync(f.arquivo, 'utf8'))
}

function vivo(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

describe('matar', () => {
  it('para o filho e o neto que o shell subiu', async () => {
    const f = filho(60)
    const neto = await pidDoNeto(f)
    expect(vivo(neto)).toBe(true)
    matar(f)
    await fim(f)
    await expect.poll(() => vivo(neto)).toBe(false)
  })

  // O `vp dev` põe o Vite num grupo de processos dele: o sinal ao grupo do
  // filho não chega lá, e o PID pai, sim.
  it.skipIf(process.platform === 'win32')(
    'para também o neto que abriu um grupo próprio',
    async () => {
      const f = filho(60, 'setsid ')
      const neto = await pidDoNeto(f)
      matar(f)
      await fim(f)
      await expect.poll(() => vivo(neto)).toBe(false)
    },
  )

  it('não toca num processo que ele não subiu', async () => {
    // Um processo de outra sessão, fora do grupo do filho.
    const outro = spawn(
      process.execPath,
      ['-e', 'setTimeout(() => {}, 60000)'],
      {
        stdio: 'ignore',
      },
    )
    const f = filho(60)
    await pidDoNeto(f)
    matar(f)
    await fim(f)
    expect(vivo(outro.pid!)).toBe(true)
    outro.kill()
  })

  it('um filho que já saiu fica como está', async () => {
    const f = filho(0)
    expect(await fim(f)).toBe(0)
    expect(() => matar(f)).not.toThrow()
  })
})

describe('comLimite', () => {
  it('o que passa do limite é parado, com a árvore, e avisa', async () => {
    const f = filho(60)
    let avisou = false
    comLimite(f, 200, () => {
      avisou = true
    })
    const inicio = Date.now()
    expect(await fim(f)).not.toBe(0)
    expect(avisou).toBe(true)
    expect(Date.now() - inicio).toBeLessThan(10_000)
  })

  it('o que acaba a tempo não é parado, e não avisa', async () => {
    const f = filho(0)
    let avisou = false
    comLimite(f, 5_000, () => {
      avisou = true
    })
    expect(await fim(f)).toBe(0)
    expect(avisou).toBe(false)
  })
})
