// The host's Nginx checked by the declared format (spec #23, Testing seam 4;
// ADR 0001): the access_log never carries the query, the error_log is the
// site's and rotates daily keeping 3, and every response carries
// `Referrer-Policy: strict-origin`.

import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vite-plus/test'
import { HOST_CONFIG, STATS } from '../scripts/vps.ts'

const folder = new URL('./', import.meta.url)
const vhost = readFileSync(new URL('temestudo.conf', folder), 'utf8')
const logFormat = readFileSync(
  new URL('log-without-query.conf', folder),
  'utf8',
)
const rotation = readFileSync(new URL('logrotate-temestudo', folder), 'utf8')

type Directive = { name: string; args: string[]; children?: Directive[] }

/** Enough of Nginx's grammar for the vhost: `name args;` directives,
 * `name args { … }` blocks, `#` comments and single or double quotes. */
function parse(text: string): Directive[] {
  const tokens = text.match(/'[^']*'|"[^"]*"|#[^\n]*|[{};]|[^\s{};'"#]+/g) ?? []
  let i = 0
  const block = (): Directive[] => {
    const directives: Directive[] = []
    let current: string[] = []
    while (i < tokens.length) {
      const t = tokens[i++]
      if (t.startsWith('#')) continue
      if (t === ';') {
        directives.push({ name: current[0], args: current.slice(1) })
        current = []
      } else if (t === '{') {
        directives.push({
          name: current[0],
          args: current.slice(1),
          children: block(),
        })
        current = []
      } else if (t === '}') return directives
      else current.push(t.replace(/^(['"])(.*)\1$/s, '$2'))
    }
    return directives
  }
  return block()
}

const top = parse(vhost)
const ofLog = parse(logFormat)
const servers = top.filter((d) => d.name === 'server')
const named = (block: Directive[] | undefined, name: string) =>
  (block ?? []).filter((d) => d.name === name)

/** Every block that declares an `add_header` drops the ones outside it: in
 * Nginx, an `add_header` inside `location` erases the `server` ones. */
function blocksWithHeaders(block: Directive[]): Directive[][] {
  return block.flatMap((d) =>
    d.children ? [d.children, ...blocksWithHeaders(d.children)] : [],
  )
}

// Everything that copies the query, or the whole address the visitor came
// from.
const VARIABLES_WITH_QUERY =
  /\$(request|request_uri|args|query_string|is_args|arg_\w+|http_referer|request_body|uri_with_args)\b/

describe('the access_log format', () => {
  test('is a single log_format, which carries neither the query nor the Referer', () => {
    const formats = named(ofLog, 'log_format')
    expect(formats.map((f) => f.args[0])).toEqual(['temestudo_sem_query'])
    const format = formats[0].args.slice(1).join(' ')
    expect(format).toContain('$request_method')
    expect(format).toContain('$status')
    expect(format).toContain('$request_time')
    expect(format).toContain('$temestudo_caminho')
    expect(format).not.toMatch(VARIABLES_WITH_QUERY)
  })

  test("the log's path is the request cut before the first ?", () => {
    const [map] = named(ofLog, 'map')
    expect(map.args).toEqual(['$request_uri', '$temestudo_caminho'])
    const [rule] = (map.children ?? []).filter((d) => d.name.startsWith('~'))
    const regex = new RegExp(rule.name.slice(1))
    const capture = rule.args[0].slice(1)
    const path = (uri: string) => uri.match(regex)?.groups?.[capture]
    expect(path('/grupo-possivel?v=1&g=h&p=m')).toBe('/grupo-possivel')
    expect(path('/?g=mulher%20trans')).toBe('/')
    expect(path('/guias/onde-conhecer')).toBe('/guias/onde-conhecer')
  })
})

describe('the temestudo.cloud vhost', () => {
  test('declares no other log_format: all come from log-without-query.conf', () => {
    expect(named(top, 'log_format')).toEqual([])
  })

  test("each server writes the access_log in the no-query format and the site's error_log", () => {
    expect(servers.length).toBeGreaterThanOrEqual(3)
    for (const server of servers) {
      expect(named(server.children, 'access_log').map((d) => d.args)).toEqual([
        ['/var/log/nginx/temestudo/access.log', 'temestudo_sem_query'],
      ])
      expect(named(server.children, 'error_log').map((d) => d.args[0])).toEqual(
        ['/var/log/nginx/temestudo/error.log'],
      )
    }
  })

  test('no access_log, in any block, uses another format', () => {
    const all = (block: Directive[]): Directive[] =>
      block.flatMap((d) => [d, ...(d.children ? all(d.children) : [])])
    for (const d of all(top).filter((d) => d.name === 'access_log')) {
      expect(d.args[1]).toBe('temestudo_sem_query')
    }
  })

  test('a request to another host or to the IP falls into a default_server with the same log', () => {
    const defaults = servers.filter((s) =>
      named(s.children, 'listen').some((l) =>
        l.args.includes('default_server'),
      ),
    )
    const ports = defaults.flatMap((s) =>
      named(s.children, 'listen').map((l) => l.args[0]),
    )
    expect(ports).toEqual(expect.arrayContaining(['80', '443']))
  })

  test('every block that writes headers sends Referrer-Policy: strict-origin', () => {
    const https = servers.filter(
      (s) =>
        named(s.children, 'server_name').some((n) =>
          n.args.includes('temestudo.cloud'),
        ) && named(s.children, 'listen').some((l) => l.args.includes('ssl')),
    )
    expect(https).toHaveLength(1)
    const blocks = blocksWithHeaders(https)
    const withHeader = blocks.filter((b) => named(b, 'add_header').length > 0)
    expect(withHeader.length).toBeGreaterThan(0)
    expect(named(https[0].children, 'add_header').length).toBeGreaterThan(0)
    for (const block of withHeader) {
      expect(named(block, 'add_header').map((d) => d.args)).toContainEqual([
        'Referrer-Policy',
        'strict-origin',
        'always',
      ])
    }
  })

  test('the proxy to the container comes from the include the deploy writes', () => {
    expect(vhost).toContain('include /etc/nginx/temestudo/temestudo-app.conf;')
  })
})

describe('the stats.temestudo.cloud vhost (GoatCounter, #35)', () => {
  const stats = parse(
    readFileSync(new URL('temestudo-stats.conf', folder), 'utf8'),
  )
  const blocks = stats.filter((d) => d.name === 'server')
  const all = (block: Directive[]): Directive[] =>
    block.flatMap((d) => [d, ...(d.children ? all(d.children) : [])])

  test('only serves stats.temestudo.cloud, on 80 and 443', () => {
    expect(
      blocks.map((s) =>
        named(s.children, 'server_name').flatMap((n) => n.args),
      ),
    ).toEqual([['stats.temestudo.cloud'], ['stats.temestudo.cloud']])
    expect(named(stats, 'log_format')).toEqual([])
  })

  test("each server writes in the no-query format and to the site's error_log", () => {
    for (const server of blocks) {
      expect(named(server.children, 'access_log').map((d) => d.args)).toEqual([
        ['/var/log/nginx/temestudo/access.log', 'temestudo_sem_query'],
      ])
      expect(named(server.children, 'error_log').map((d) => d.args[0])).toEqual(
        ['/var/log/nginx/temestudo/error.log'],
      )
    }
    for (const d of all(stats).filter((d) => d.name === 'access_log')) {
      expect(d.args[1]).toBe('temestudo_sem_query')
    }
  })

  test("80 serves certbot's challenge and sends the rest to https", () => {
    const http = blocks.find((s) =>
      named(s.children, 'listen').some((l) => l.args[0] === '80'),
    )
    const locations = named(http?.children, 'location')
    expect(locations.map((l) => l.args)).toContainEqual([
      '^~',
      '/.well-known/acme-challenge/',
    ])
    const acme = locations.find((l) =>
      l.args.includes('/.well-known/acme-challenge/'),
    )
    expect(named(acme?.children, 'root').map((d) => d.args)).toEqual([
      ['/opt/temestudo/acme'],
    ])
  })

  test("443 passes to the GoatCounter container on 127.0.0.1, with the visitor's IP", () => {
    const https = blocks.find((s) =>
      named(s.children, 'listen').some((l) => l.args.includes('ssl')),
    )
    expect(named(https?.children, 'include').map((d) => d.args[0])).toContain(
      '/etc/nginx/temestudo/tls.conf',
    )
    const proxy = all(https?.children ?? []).filter(
      (d) => d.name === 'proxy_pass',
    )
    expect(proxy.map((d) => d.args[0])).toEqual([
      `http://127.0.0.1:${STATS.port}`,
    ])
    const headers = all(https?.children ?? []).filter(
      (d) => d.name === 'proxy_set_header',
    )
    expect(headers.map((d) => d.args)).toContainEqual([
      'X-Forwarded-For',
      '$remote_addr',
    ])
    expect(
      named(https?.children, 'add_header').map((d) => d.args),
    ).toContainEqual(['Referrer-Policy', 'strict-origin', 'always'])
  })

  test('the deploy installs the file and enables it', () => {
    expect(HOST_CONFIG).toContainEqual(['temestudo-stats.conf', STATS.vhost])
  })
})

describe("the site's log rotation", () => {
  const stanzas = [...rotation.matchAll(/^([^\s#][^{]*)\{([^}]*)\}/gm)].map(
    (m) => ({
      files: m[1].trim().split(/\s+/),
      rules: m[2]
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#')),
    }),
  )

  test('the error_log rotates daily and never exceeds 3 days, counting the current file', () => {
    const error = stanzas.find((e) =>
      e.files.includes('/var/log/nginx/temestudo/error.log'),
    )
    expect(error?.rules).toContain('daily')
    const rotate = Number(
      error?.rules.find((r) => r.startsWith('rotate '))?.split(' ')[1],
    )
    // Today's `error.log` plus `rotate` rotated files, one per day.
    expect(1 + rotate).toBe(3)
    expect(error?.rules.some((r) => r.startsWith('postrotate'))).toBe(true)
  })
})
