// The deploy's `ensureStats()` against a real GoatCounter, in a local Docker
// (#35, review of #23). The script is the same that goes over ssh, run here
// with another container, volume and port name, and the password file in a
// temporary folder. It pulls the image and starts a container, so it only
// runs with TEST_GOATCOUNTER=1:
//
//   TEST_GOATCOUNTER=1 pnpm --filter frontend exec vp test run scripts/stats.docker.test.ts
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vite-plus/test'
import { ensureStats, stopStatsWithoutSite, STATS } from './deploy-plan.ts'

const ON = process.env.TEST_GOATCOUNTER === '1'

const TEST = {
  ...STATS,
  container: `temestudo-stats-test-${process.pid}`,
  volume: `temestudo-stats-test-${process.pid}`,
  port: 3900 + (process.pid % 90),
}

const folder = mkdtempSync(join(tmpdir(), 'stats-test-'))
const passwordFile = join(folder, 'goatcounter-senha')

function bash(script: string) {
  const r = spawnSync('bash', ['-c', `set -euo pipefail\n${script}`], {
    encoding: 'utf8',
  })
  if (r.status !== 0)
    throw new Error(
      `the script exited with ${r.status}:\n${r.stdout}\n${r.stderr}`,
    )
  return r.stdout
}

const ensure = (email?: string) =>
  bash(ensureStats({ stats: TEST, passwordFile, email }))

/** A query on GoatCounter's SQLite; the first line is the header. */
const query = (sql: string) =>
  bash(`docker exec ${TEST.container} goatcounter db query "${sql}"`)
    .trim()
    .split('\n')
    .slice(1)

const settings = () =>
  JSON.parse(
    query(`select settings from sites where cname = '${TEST.host}'`)[0] ??
      'null',
  ) as {
    collect: number
    data_retention: number
  }

describe.skipIf(!ON)(
  'GoatCounter in the deploy, in a local Docker',
  { timeout: 120_000 },
  () => {
    const clean = () =>
      bash(`docker rm -f ${TEST.container} >/dev/null 2>&1 || true
docker volume rm ${TEST.volume} >/dev/null 2>&1 || true`)
    beforeAll(clean)
    afterAll(() => {
      clean()
      rmSync(folder, { recursive: true, force: true })
    })

    test('the first deploy creates the site and the user, with the random password in a 600 file', () => {
      const output = ensure()
      expect(output).toContain('site stats.temestudo.cloud created')
      expect(query(`select cname from sites`)).toEqual([TEST.host])
      expect(query(`select email from users`)).toEqual([
        'admin@temestudo.cloud',
      ])
      const password = readFileSync(passwordFile, 'utf8').trim()
      expect(password).toMatch(/^[A-Za-z0-9]{32,50}$/)
      expect(statSync(passwordFile).mode & 0o777).toBe(0o600)
    })

    test("the file's password gets into GoatCounter", async () => {
      const password = readFileSync(passwordFile, 'utf8').trim()
      // The same POST as the login form: right, it comes back with the
      // `key` cookie.
      const logIn = (password: string) =>
        bash(`curl -s -o /dev/null -D - -H 'Host: ${TEST.host}' --data-urlencode 'email=admin@temestudo.cloud' \
  --data-urlencode 'password=${password}' http://127.0.0.1:${TEST.port}/user/requestlogin`)
      expect(logIn(password)).toMatch(/^set-cookie: key=/im)
      expect(logIn('wrong123')).not.toMatch(/^set-cookie: key=/im)
    })

    test('collection is only referrer, screen and country, and retention 31 days', () => {
      expect(settings()).toMatchObject({
        collect: 2 + 8 + 16,
        data_retention: 31,
      })
    })

    test('the next deploy creates no other site nor changes the password, and undoes a changed configuration', () => {
      const password = readFileSync(passwordFile, 'utf8')
      query(
        `update sites set settings = json_set(settings, '$.collect', 190, '$.data_retention', 0)`,
      )
      const output = ensure()
      expect(output).not.toContain('created')
      expect(query(`select count(*) from sites`)).toEqual(['1'])
      expect(readFileSync(passwordFile, 'utf8')).toBe(password)
      expect(settings()).toMatchObject({ collect: 26, data_retention: 31 })
    })

    test('a GoatCounter live without a site is stopped when its deploy fails', () => {
      expect(bash(stopStatsWithoutSite(TEST))).toBe('')
      expect(
        bash(`docker inspect -f '{{.State.Running}}' ${TEST.container}`).trim(),
      ).toBe('true')

      clean()
      bash(`docker run -d --name ${TEST.container} -v ${TEST.volume}:/home/goatcounter/goatcounter-data \
  ${TEST.image} serve -listen :8080 -tls http -automigrate >/dev/null
sleep 3`)
      expect(bash(stopStatsWithoutSite(TEST))).toContain('GoatCounter stopped')
      expect(
        bash(`docker inspect -f '{{.State.Running}}' ${TEST.container}`).trim(),
      ).toBe('false')
    })

    test('the e-mail comes from GOATCOUNTER_EMAIL on a new volume', () => {
      clean()
      rmSync(passwordFile, { force: true })
      ensure('outra@temestudo.cloud')
      expect(query(`select email from users`)).toEqual([
        'outra@temestudo.cloud',
      ])
    })
  },
)

test('an e-mail that is not an e-mail does not go into the script', () => {
  expect(() => ensureStats({ email: "a@b.com'; rm -rf /" })).toThrow(/e-mail/)
  expect(() => ensureStats({ email: 'no-at-sign' })).toThrow(/e-mail/)
})
