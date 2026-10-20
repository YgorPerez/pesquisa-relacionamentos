// The deploy against a fake VPS (`fake-docker.ts`): the same plan that goes
// over SSH, run in a bash, with no real Docker or Nginx.
import { join } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import { fakeFrontend, fakeVps } from './fake-docker.ts'
import { publish, rollback } from './vps.ts'

const SHA_1 = 'aaaaaaa'
const SHA_2 = 'bbbbbbb'
const SHA_3 = 'ccccccc'

/** The include that tells Nginx the app's port. */
const proxyTo = (port: number) => `proxy_pass http://127.0.0.1:${port};\n`

function aVps() {
  const vps = fakeVps()
  const log: string[] = []
  const say = (line: string) => log.push(line)
  return {
    ...vps,
    log,
    publish: (sha: string) =>
      publish({
        output: fakeFrontend(sha),
        sha,
        vps: vps.vps,
        paths: vps.paths,
        say,
      }),
    rollback: (sha?: string) =>
      rollback({ sha, vps: vps.vps, paths: vps.paths, say }),
    /** What is live: the include's port, and the app's image and port. */
    live: () => ({
      include: vps.read(vps.paths.include),
      app: vps.container('temestudo-app'),
    }),
  }
}

describe.skipIf(process.platform === 'win32')('the deploy on the VPS', () => {
  it('the first deploy starts the app on the first port and installs the vhost', () => {
    const vps = aVps()

    vps.publish(SHA_1)

    expect(vps.live()).toEqual({
      include: proxyTo(3011),
      app: {
        image: `temestudo-app:sha-${SHA_1}`,
        port: '3011',
        running: true,
      },
    })
    expect(vps.containers().sort()).toEqual([
      'temestudo-app',
      'temestudo-stats',
    ])
    expect(vps.read(vps.paths.vhost)).toBe(`temestudo.conf ${SHA_1}\n`)
    const { sitesEnabled } = vps.paths
    expect(vps.read(join(sitesEnabled, 'temestudo.conf'))).not.toBeNull()
    expect(vps.read(join(sitesEnabled, 'default'))).toBeNull()
    expect(vps.read(join(vps.paths.folder, 'no-ar'))).toBe(`${SHA_1}\n`)
    expect(vps.read(join(vps.paths.folder, 'anterior'))).toBeNull()
  })

  it('the log says how long each step took, and the total', () => {
    const vps = aVps()

    vps.publish(SHA_1)

    const times = vps.log.filter((l) => /took|Total/.test(l))
    expect(times.map((l) => l.replace(/[\d.]+ s/, 'N s'))).toEqual([
      'Upload took N s.',
      'Image took N s.',
      'GoatCounter took N s.',
      'Swap took N s.',
      'Total: N s.',
    ])
  })

  it('the next deploy starts on the other port, reloads Nginx and stops the old one', () => {
    const vps = aVps()
    vps.publish(SHA_1)
    vps.calls()

    vps.publish(SHA_2)

    expect(vps.live()).toEqual({
      include: proxyTo(3031),
      app: {
        image: `temestudo-app:sha-${SHA_2}`,
        port: '3031',
        running: true,
      },
    })
    expect(vps.read(join(vps.paths.folder, 'anterior'))).toBe(`${SHA_1}\n`)
    const calls = vps.calls()
    const reload = calls.indexOf('systemctl reload nginx')
    const stop = calls.indexOf('docker stop --timeout 30 temestudo-app')
    expect(reload).toBeGreaterThan(-1)
    // The old one only stops after Nginx already passes to the new one.
    expect(stop).toBeGreaterThan(reload)
    expect(vps.read(vps.paths.vhost)).toBe(`temestudo.conf ${SHA_2}\n`)
  })

  it('the third deploy goes back to the first port and deletes the images before the previous one', () => {
    const vps = aVps()
    vps.publish(SHA_1)
    vps.publish(SHA_2)

    vps.publish(SHA_3)

    expect(vps.live().include).toBe(proxyTo(3011))
    expect(vps.images()).toEqual([
      'arp242/goatcounter:2.7.0',
      `temestudo-app:sha-${SHA_2}`,
      `temestudo-app:sha-${SHA_3}`,
    ])
  })

  it('rolling back without a SHA swaps to the previous deploy, without touching the vhost', () => {
    const vps = aVps()
    vps.publish(SHA_1)
    vps.publish(SHA_2)

    vps.rollback()

    expect(vps.live()).toEqual({
      include: proxyTo(3011),
      app: {
        image: `temestudo-app:sha-${SHA_1}`,
        port: '3011',
        running: true,
      },
    })
    expect(vps.read(vps.paths.vhost)).toBe(`temestudo.conf ${SHA_2}\n`)
    expect(vps.read(join(vps.paths.folder, 'anterior'))).toBe(`${SHA_2}\n`)
    expect(vps.log).toContain(`Rolling back to sha-${SHA_1}.`)
  })

  it('rolling back to a SHA the VPS did not keep leaves what is live alone', () => {
    const vps = aVps()
    vps.publish(SHA_1)
    const before = vps.live()

    expect(() => vps.rollback('deadbee')).toThrow(
      'The VPS does not have the image temestudo-app:sha-deadbee.',
    )
    expect(vps.live()).toEqual(before)
  })

  it('rolling back with no previous deploy asks for the SHA', () => {
    const vps = aVps()
    vps.publish(SHA_1)

    expect(() => vps.rollback()).toThrow('give the SHA')
  })

  it('a new container that does not answer goes, and the old one stays live', () => {
    const vps = aVps()
    vps.publish(SHA_1)
    const before = vps.live()
    vps.calls()
    vps.breakWith('app-does-not-answer')

    expect(() => vps.publish(SHA_2)).toThrow(
      /The new app did not answer on \/ at port 3031.*the log of temestudo-app-novo/s,
    )
    expect(vps.live()).toEqual(before)
    expect(vps.containers()).not.toContain('temestudo-app-novo')
    expect(vps.calls()).not.toContain('systemctl reload nginx')
    expect(vps.read(vps.paths.vhost)).toBe(`temestudo.conf ${SHA_1}\n`)
  })

  it('an nginx -t that refuses undoes the new configuration, and the old one stays live', () => {
    const vps = aVps()
    vps.publish(SHA_1)
    const before = vps.live()
    vps.calls()
    vps.breakWith('nginx-refuses')

    expect(() => vps.publish(SHA_2)).toThrow(
      /unknown directive.*nginx -t refused the new configuration/s,
    )
    expect(vps.live()).toEqual(before)
    expect(vps.containers()).not.toContain('temestudo-app-novo')
    expect(vps.calls()).not.toContain('systemctl reload nginx')
    for (const [name, target] of vps.paths.config)
      expect(vps.read(target)).toBe(`${name} ${SHA_1}\n`)
  })

  it('an nginx -t that refuses the first deploy leaves no vhost at all', () => {
    const vps = aVps()
    vps.breakWith('nginx-refuses')

    expect(() => vps.publish(SHA_1)).toThrow(/nginx -t refused/)
    expect(vps.live()).toEqual({ include: null, app: null })
    for (const [, target] of vps.paths.config)
      expect(vps.read(target)).toBeNull()
    expect(vps.read(join(vps.paths.sitesEnabled, 'temestudo.conf'))).toBeNull()
  })
})

describe.skipIf(process.platform === 'win32')(
  'GoatCounter in the deploy',
  () => {
    it('the first deploy creates the site, keeps the password and applies the collection', () => {
      const vps = aVps()

      vps.publish(SHA_1)

      expect(vps.container('temestudo-stats')).toEqual({
        image: 'arp242/goatcounter:2.7.0',
        port: '3051',
        running: true,
      })
      expect(vps.read(vps.paths.statsPassword)).toMatch(/^[A-Za-z0-9]{40}\n$/)
      expect(vps.statsConfigured()).toBe(true)
      expect(vps.log.join('\n')).toContain(
        `GoatCounter: site stats.temestudo.cloud created, login admin@temestudo.cloud, password in ${vps.paths.statsPassword}.`,
      )
    })

    it('with it live and configured, the deploy does not swap it', () => {
      const vps = aVps()
      vps.publish(SHA_1)
      const password = vps.read(vps.paths.statsPassword)
      vps.calls()

      vps.publish(SHA_2)

      const calls = vps.calls()
      expect(calls.some((c) => c.startsWith('docker pull'))).toBe(false)
      expect(calls.some((c) => c.startsWith('docker restart'))).toBe(false)
      expect(vps.read(vps.paths.statsPassword)).toBe(password)
      expect(vps.log.join('\n')).toContain(
        'GoatCounter arp242/goatcounter:2.7.0 already live on port 3051.',
      )
    })

    it('if the site is not created, it stays stopped, without a password, and the site comes up anyway', () => {
      const vps = aVps()
      vps.breakWith('site-creation-fails')

      vps.publish(SHA_1)

      expect(vps.container('temestudo-stats')?.running).toBe(false)
      expect(vps.read(vps.paths.statsPassword)).toBeNull()
      expect(vps.live().app?.running).toBe(true)
      expect(
        vps.log.some((l) =>
          l.startsWith(
            'Warning: GoatCounter did not come up (the script exited with 1: Could not create the site',
          ),
        ),
      ).toBe(true)
    })

    it('an e-mail the deploy refuses becomes a warning, and the site comes up', () => {
      const vps = aVps()

      publish({
        output: fakeFrontend(SHA_1),
        sha: SHA_1,
        email: "a@b.com'; rm -rf /",
        vps: vps.vps,
        paths: vps.paths,
        say: (l) => vps.log.push(l),
      })

      expect(vps.live().app?.running).toBe(true)
      expect(vps.containers()).not.toContain('temestudo-stats')
      expect(vps.log.join('\n')).toContain(
        `Warning: GoatCounter did not come up (the script exited with 1: "a@b.com'; rm -rf /" is not an e-mail the deploy accepts.). The site goes on.`,
      )
    })
  },
)
