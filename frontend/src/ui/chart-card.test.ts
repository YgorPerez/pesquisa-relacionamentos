// One card at a time across the page (#499): hover shows it, a pin keeps it,
// and a pinned card holds until it is closed.
import { afterEach, expect, it, vi } from 'vite-plus/test'
import { countEvent } from '#/analytics/counting'
import { DOTS } from './visual-chart.example'
import {
  closeCard,
  closeCardOf,
  currentCard,
  hoverCard,
  pinCard,
  type CardTarget,
} from './chart-card'

// The way out to GoatCounter: what the reader did becomes an event here.
vi.mock('#/analytics/counting', () => ({ countEvent: vi.fn() }))

afterEach(() => {
  closeCard()
  hoverCard(null, 'a')
  hoverCard(null, 'b')
  vi.mocked(countEvent).mockClear()
})

const [first, second] = DOTS.points
const target = (chart: string, point = first!): CardTarget => ({
  chart,
  point,
  anchor: () => new DOMRect(),
  via: 'pointer',
})

it('shows the hovered point and hides it when the pointer leaves', () => {
  hoverCard(target('a'))
  expect(currentCard()).toMatchObject({ pinned: false })
  expect(currentCard().target?.chart).toBe('a')
  hoverCard(null, 'a')
  expect(currentCard().target).toBeNull()
})

it("does not let one chart's leaving hide another chart's card", () => {
  hoverCard(target('a'))
  hoverCard(null, 'b')
  expect(currentCard().target?.chart).toBe('a')
})

it('keeps a pinned card while the pointer hovers something else', () => {
  pinCard(target('a'))
  hoverCard(target('a', second))
  hoverCard(target('b', second))
  hoverCard(null, 'a')
  expect(currentCard()).toMatchObject({ pinned: true })
  expect(currentCard().target?.point.key).toBe(first!.key)
})

it('replaces a pinned card with the next pin, and unpins on the same mark', () => {
  pinCard(target('a'))
  pinCard(target('b', second))
  expect(currentCard().target?.chart).toBe('b')
  pinCard(target('b', second))
  expect(currentCard()).toMatchObject({ target: null, pinned: false })
})

it('stays closed on the same point until the pointer or the focus leaves it', () => {
  hoverCard(target('a'))
  pinCard(target('a'))
  closeCard()
  hoverCard(target('a'))
  expect(currentCard().target).toBeNull()
  hoverCard(null, 'a')
  hoverCard(target('a'))
  expect(currentCard().target?.chart).toBe('a')
  closeCard()
  hoverCard(target('a', second))
  expect(currentCard().target?.point.key).toBe(second!.key)
})

it('shows the same point again when the pointer left it while it was pinned', () => {
  hoverCard(target('a'))
  pinCard(target('a'))
  hoverCard(null, 'a')
  closeCard()
  hoverCard(target('a'))
  expect(currentCard().target?.chart).toBe('a')
})

it("closes a chart's card only from that chart", () => {
  pinCard(target('a'))
  closeCardOf('b')
  expect(currentCard().pinned).toBe(true)
  closeCardOf('a')
  expect(currentCard().target).toBeNull()
})

it('counts each pin under the chart it pinned, whichever point', () => {
  pinCard(target('a'))
  pinCard(target('a', second))
  pinCard(target('b'))
  expect(vi.mocked(countEvent).mock.calls).toEqual([
    ['chart-card/a'],
    ['chart-card/a'],
    ['chart-card/b'],
  ])
})

it('does not count a hover, and a hover before the pin does not count twice', () => {
  hoverCard(target('a'))
  hoverCard(target('a', second))
  expect(countEvent).not.toHaveBeenCalled()
  pinCard(target('a', second))
  expect(countEvent).toHaveBeenCalledTimes(1)
})

it('does not count the click that unpins, and counts the next pin', () => {
  pinCard(target('a'))
  pinCard(target('a'))
  expect(currentCard().pinned).toBe(false)
  expect(countEvent).toHaveBeenCalledTimes(1)
  pinCard(target('a'))
  expect(countEvent).toHaveBeenCalledTimes(2)
})
