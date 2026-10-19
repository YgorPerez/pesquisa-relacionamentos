// O `garantirOStats()` do deploy contra um GoatCounter de verdade, num Docker
// local (#35, revisão do #23). O script é o mesmo que vai pela ssh, rodado
// aqui com outro nome de contêiner, de volume e de porta, e o arquivo da
// senha numa pasta temporária. Puxa a imagem e sobe um contêiner, então só
// roda com TESTAR_GOATCOUNTER=1:
//
//   TESTAR_GOATCOUNTER=1 pnpm --filter frontend exec vitest run scripts/stats.docker.test.ts
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { garantirOStats, pararOStatsSemSite, STATS } from './vps.ts'

const LIGADO = process.env.TESTAR_GOATCOUNTER === '1'

const TESTE = {
  ...STATS,
  container: `temestudo-stats-teste-${process.pid}`,
  volume: `temestudo-stats-teste-${process.pid}`,
  porta: 3900 + (process.pid % 90),
}

const pasta = mkdtempSync(join(tmpdir(), 'stats-teste-'))
const arquivoDaSenha = join(pasta, 'goatcounter-senha')

function bash(script: string) {
  const r = spawnSync('bash', ['-c', `set -euo pipefail\n${script}`], { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`o script saiu com ${r.status}:\n${r.stdout}\n${r.stderr}`)
  return r.stdout
}

const garantir = (email?: string) => bash(garantirOStats({ stats: TESTE, arquivoDaSenha, email }))

/** Uma consulta no SQLite do GoatCounter; a primeira linha é o cabeçalho. */
const consulta = (sql: string) =>
  bash(`docker exec ${TESTE.container} goatcounter db query "${sql}"`).trim().split('\n').slice(1)

const configuracao = () =>
  JSON.parse(consulta(`select settings from sites where cname = '${TESTE.host}'`)[0] ?? 'null') as {
    collect: number
    data_retention: number
  }

describe.skipIf(!LIGADO)('GoatCounter no deploy, num Docker local', { timeout: 120_000 }, () => {
  const limpar = () => bash(`docker rm -f ${TESTE.container} >/dev/null 2>&1 || true
docker volume rm ${TESTE.volume} >/dev/null 2>&1 || true`)
  beforeAll(limpar)
  afterAll(() => {
    limpar()
    rmSync(pasta, { recursive: true, force: true })
  })

  test('o primeiro deploy cria o site e o usuário, com a senha aleatória num arquivo 600', () => {
    const saida = garantir()
    expect(saida).toContain('site stats.temestudo.com criado')
    expect(consulta(`select cname from sites`)).toEqual([TESTE.host])
    expect(consulta(`select email from users`)).toEqual(['admin@temestudo.com'])
    const senha = readFileSync(arquivoDaSenha, 'utf8').trim()
    expect(senha).toMatch(/^[A-Za-z0-9]{32,50}$/)
    expect(statSync(arquivoDaSenha).mode & 0o777).toBe(0o600)
  })

  test('a senha do arquivo entra no GoatCounter', async () => {
    const senha = readFileSync(arquivoDaSenha, 'utf8').trim()
    // O mesmo POST do formulário de login: certo, volta com o cookie `key`.
    const entrar = (password: string) =>
      bash(`curl -s -o /dev/null -D - -H 'Host: ${TESTE.host}' --data-urlencode 'email=admin@temestudo.com' \
  --data-urlencode 'password=${password}' http://127.0.0.1:${TESTE.porta}/user/requestlogin`)
    expect(entrar(senha)).toMatch(/^set-cookie: key=/im)
    expect(entrar('errada123')).not.toMatch(/^set-cookie: key=/im)
  })

  test('a coleta fica só em referência, tela e país, e a retenção em 31 dias', () => {
    expect(configuracao()).toMatchObject({ collect: 2 + 8 + 16, data_retention: 31 })
  })

  test('o deploy seguinte não cria outro site nem troca a senha, e desfaz configuração mexida', () => {
    const senha = readFileSync(arquivoDaSenha, 'utf8')
    consulta(`update sites set settings = json_set(settings, '$.collect', 190, '$.data_retention', 0)`)
    const saida = garantir()
    expect(saida).not.toContain('criado')
    expect(consulta(`select count(*) from sites`)).toEqual(['1'])
    expect(readFileSync(arquivoDaSenha, 'utf8')).toBe(senha)
    expect(configuracao()).toMatchObject({ collect: 26, data_retention: 31 })
  })

  test('um GoatCounter no ar sem site é parado quando o deploy dele falha', () => {
    expect(bash(pararOStatsSemSite(TESTE))).toBe('')
    expect(bash(`docker inspect -f '{{.State.Running}}' ${TESTE.container}`).trim()).toBe('true')

    limpar()
    bash(`docker run -d --name ${TESTE.container} -v ${TESTE.volume}:/home/goatcounter/goatcounter-data \
  ${TESTE.imagem} serve -listen :8080 -tls http -automigrate >/dev/null
sleep 3`)
    expect(bash(pararOStatsSemSite(TESTE))).toContain('GoatCounter parado')
    expect(bash(`docker inspect -f '{{.State.Running}}' ${TESTE.container}`).trim()).toBe('false')
  })

  test('o e-mail vem do GOATCOUNTER_EMAIL num volume novo', () => {
    limpar()
    rmSync(arquivoDaSenha, { force: true })
    garantir('outra@temestudo.com')
    expect(consulta(`select email from users`)).toEqual(['outra@temestudo.com'])
  })
})

test('um e-mail que não é e-mail não vai para o script', () => {
  expect(() => garantirOStats({ email: "a@b.com'; rm -rf /" })).toThrow(/e-mail/)
  expect(() => garantirOStats({ email: 'sem-arroba' })).toThrow(/e-mail/)
})
