import { describe, expect, it } from 'vite-plus/test'
import {
  indexIds,
  similarIds,
  readArguments,
  routeName,
} from './capture-arguments.ts'

const DEFAULTS = {
  out: '/tmp/captures',
  app: 'http://localhost:44941',
  storybook: 'http://localhost:44943',
}

/** The error the command line gives, or `null` if it is valid. */
const errorOf = (argv: string[]) => {
  const result = readArguments(argv, DEFAULTS)
  return 'error' in result ? result.error : null
}

describe('readArguments', () => {
  it("with only the route, captures mobile and desktop from this checkout's start", () => {
    expect(readArguments(['/prioridades'], DEFAULTS)).toEqual({
      route: '/prioridades',
      base: 'http://localhost:44941',
      out: '/tmp/captures',
      name: 'prioridades',
      taps: [],
      full: false,
      video: false,
      screens: ['mobile', 'desktop'],
    })
  })

  it('reads each option, and --tap repeats in the given order', () => {
    const options = readArguments(
      [
        '/estudos/costa-2018?de=busca',
        '--tap',
        'text=Como ler',
        '--tap',
        '[data-ficha] >> nth=0',
        '--full',
        '--video',
        '--only',
        'mobile',
        '--name',
        'ficha',
        '--out',
        '/tmp/x',
        '--base',
        'http://localhost:3100/',
      ],
      DEFAULTS,
    )
    expect(options).toMatchObject({
      route: '/estudos/costa-2018?de=busca',
      base: 'http://localhost:3100',
      out: '/tmp/x',
      name: 'ficha',
      taps: ['text=Como ler', '[data-ficha] >> nth=0'],
      full: true,
      video: true,
      screens: ['mobile'],
    })
  })

  it('a route without a slash gets one, and --port applies to it', () => {
    expect(readArguments(['dicas', '--port', '20090'], DEFAULTS)).toMatchObject(
      { route: '/dicas', base: 'http://localhost:20090' },
    )
  })

  it.each([
    [[], 'The route is missing'],
    [['/a', '/b'], 'A single route'],
    [['/a', '--fly'], 'Unknown option: --fly'],
    [['/a', '--tap'], '--tap takes a value'],
    [['/a', '--only', 'tablet'], '--only takes mobile or desktop'],
    [['/a', '--at', '0'], '--at is only for --story'],
  ])('refuses %j', (argv, error) => {
    expect(errorOf(argv)).toContain(error)
  })
})

describe('readArguments with --story', () => {
  it("photographs the story on mobile, from this checkout's Storybook, at the moments in order", () => {
    expect(
      readArguments(
        ['--story', 'ui-profile--empty', '--at', '1000,0,500,0'],
        DEFAULTS,
      ),
    ).toEqual({
      story: 'ui-profile--empty',
      moments: [0, 500, 1000],
      base: 'http://localhost:44943',
      out: '/tmp/captures',
      name: 'ui-profile--empty',
      screen: 'mobile',
    })
  })

  it('without --at, photographs the load; --port and --only pick the Storybook and the screen', () => {
    expect(
      readArguments(
        ['--story', 'a--b', '--port', '20098', '--only', 'desktop'],
        DEFAULTS,
      ),
    ).toMatchObject({
      moments: [0],
      base: 'http://localhost:20098',
      screen: 'desktop',
    })
  })

  it.each([
    [['/a', '--story', 'a--b'], '--story takes no route'],
    [['--story', 'a--b', '--video'], '--video does not work with --story'],
    [['--story', 'a--b', '--tap', 'text=x'], '--tap does not work'],
    [['--story', 'a--b', '--at', '0,half'], '--at takes milliseconds'],
    [['--story', 'a--b', '--port', 'six'], '--port takes a number'],
    [['--story', 'a--b', '--port', '1', '--base', 'x'], '--base or --port'],
  ])('refuses %j', (argv, error) => {
    expect(errorOf(argv)).toContain(error)
  })
})

describe('indexIds', () => {
  it('lists the stories and leaves the docs pages out', () => {
    expect(
      indexIds({
        v: 5,
        entries: {
          'ui-profile--empty': { type: 'story' },
          'ui-profile--docs': { type: 'docs' },
        },
      }),
    ).toEqual(['ui-profile--empty'])
  })
})

describe('similarIds', () => {
  const IDS = [
    'ui-badges--strength',
    'ui-badges--with-status',
    'ui-priorities-table--full',
    'ui-priorities-table--empty',
    'ui-guide-answer--default',
    'ui-button--primary',
  ]

  it('puts first the one with more pieces of the requested id', () => {
    expect(similarIds('ui-badges--with-statu', IDS).slice(0, 2)).toEqual([
      'ui-badges--with-status',
      'ui-badges--strength',
    ])
  })

  it('finds the id by the middle piece, with slashes in place of hyphens', () => {
    expect(similarIds('priorities/table', IDS).slice(0, 2)).toEqual([
      'ui-priorities-table--full',
      'ui-priorities-table--empty',
    ])
  })

  it('finds a typo with no whole piece in common', () => {
    expect(similarIds('ui_guide_answer__default', IDS)).toEqual([
      'ui-guide-answer--default',
    ])
  })

  it('invents no similar one, and does not pass the count asked for', () => {
    expect(similarIds('map-measure--whole', IDS)).toEqual([])
    expect(similarIds('ui', IDS, 3)).toHaveLength(3)
  })
})

describe('routeName', () => {
  it('becomes a file name, without the search', () => {
    expect(routeName('/onde-conhecer-pessoas/app-ou-bar?g=mulher')).toBe(
      'onde-conhecer-pessoas-app-ou-bar',
    )
  })

  it('the root becomes "home"', () => {
    expect(routeName('/')).toBe('home')
  })
})
