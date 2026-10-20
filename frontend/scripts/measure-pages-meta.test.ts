import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import {
  compressesLikeNginx,
  type Run,
  nginxGzip,
  rowOf,
  median,
  table,
} from './measure-pages-meta.ts'

const KB = 1024

function run(partial: Partial<Run> = {}): Run {
  return { js: 150 * KB, css: 10 * KB, lcp: 1500, inp: 40, ...partial }
}

describe("each page's target", () => {
  it('a home page within the target passes', () => {
    expect(rowOf('home', [run(), run(), run()])).toEqual({
      page: 'home',
      jsKb: 150,
      cssKb: 10,
      lcpMs: 1500,
      inpMs: 40,
      failures: [],
    })
  })

  it('reads the median, and a single slow opening does not fail', () => {
    const row = rowOf('Fact sheet', [
      run({ lcp: 1400 }),
      run({ lcp: 9000, inp: 900 }),
      run({ lcp: 1600 }),
    ])
    expect(row.lcpMs).toBe(1600)
    expect(row.failures).toEqual([])
  })

  it('names each number that went over the target', () => {
    const slow = run({ js: 400 * KB, css: 40 * KB, lcp: 3000, inp: 300 })
    expect(rowOf('Guide', [slow]).failures).toEqual(['JS', 'CSS', 'LCP', 'INP'])
  })

  // The Guide carries more JS than the home page, and the target is the
  // page's.
  it("the Guide's JS fits a target the home page does not have", () => {
    const ofGuide = run({ js: 240 * KB })
    expect(rowOf('Guide', [ofGuide]).failures).toEqual([])
    expect(rowOf('home', [ofGuide]).failures).toEqual(['JS'])
  })

  it('a page that was not measured fails', () => {
    expect(rowOf('Priorities', []).failures).toContain('not measured')
  })

  it('the median of an even number of values is the mean of the middle ones', () => {
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })

  it("the table carries each column's number and target", () => {
    expect(table([rowOf('Possible group', [run({ inp: 250 })])]))
      .toBe(`| Page | JS | CSS | LCP | INP | Passes? |
|---|---|---|---|---|---|
| Possible group | 150.0 KB (≤ 250) | 10.0 KB (≤ 15) | 1.50 s (≤ 2.5) | 250 ms (≤ 200) | no (INP) |`)
  })
})

const CONF = readFileSync(
  join(import.meta.dirname, '../nginx/temestudo.conf'),
  'utf8',
)

describe("Nginx's gzip, which the local measurement imitates", () => {
  it('reads the types and the level from temestudo.conf', () => {
    expect(nginxGzip(CONF)).toEqual({
      level: 1,
      types: [
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/json',
        'image/svg+xml',
        'text/plain',
        'application/xml',
      ],
    })
  })

  it("the level written in the conf replaces Nginx's 1", () => {
    expect(nginxGzip('gzip on;\ngzip_comp_level 5;').level).toBe(5)
  })

  // The app server sends JS as `text/javascript`; an Nginx that only listed
  // `application/javascript` sent it raw.
  it("compresses the app's JS, the CSS and the page, and not the font", () => {
    const gzip = nginxGzip(CONF)
    expect(compressesLikeNginx('text/javascript; charset=utf-8', gzip)).toBe(
      true,
    )
    expect(compressesLikeNginx('text/css; charset=utf-8', gzip)).toBe(true)
    expect(compressesLikeNginx('text/html; charset=utf-8', gzip)).toBe(true)
    expect(compressesLikeNginx('font/woff2', gzip)).toBe(false)
    expect(compressesLikeNginx(undefined, gzip)).toBe(false)
  })
})
