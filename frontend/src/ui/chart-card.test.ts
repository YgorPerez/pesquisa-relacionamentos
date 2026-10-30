// One card at a time across the page (#499): hover shows it, a pin keeps it,
// and a pinned card holds until it is closed.
import { afterEach, expect, it } from 'vite-plus/test'
import { DOTS } from './visual-chart.example'
import {
  closeCard,
  closeCardOf,
  currentCard,
  hoverCard,
  pinCard,
  type CardTarget,
} from './chart-card'

afterEach(closeCard)

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

it("closes a chart's card only from that chart", () => {
  pinCard(target('a'))
  closeCardOf('b')
  expect(currentCard().pinned).toBe(true)
  closeCardOf('a')
  expect(currentCard().target).toBeNull()
})
