import { expect, test } from 'vite-plus/test'
import {
  decide,
  extractText,
  fingerprint,
  issueAction,
} from './reading-check.ts'

test('ignores small additions but reports a rewritten Reading', () => {
  const baseline = fingerprint(
    'one two three four five six seven eight nine ten',
  )
  expect(
    decide(
      baseline,
      fingerprint('one two three four five six seven eight nine ten eleven'),
      0,
    ).alert,
  ).toBe(false)
  expect(
    decide(
      baseline,
      fingerprint('a completely different article with new claims'),
      0,
    ).alert,
  ).toBe(true)
})

test('requires consecutive failures and resets the count after recovery', () => {
  const baseline = fingerprint('a reviewed reading about relationships')
  const first = decide(baseline, null, 0)
  expect(first).toMatchObject({ failures: 1, alert: false })
  expect(decide(baseline, null, first.failures)).toMatchObject({
    failures: 2,
    alert: true,
  })
  expect(decide(baseline, baseline, first.failures)).toMatchObject({
    failures: 0,
    alert: false,
  })
})

test('updates the existing issue and leaves healthy Readings alone', () => {
  expect(issueAction(false, null)).toBe('nothing')
  expect(issueAction(false, 123)).toBe('nothing')
  expect(issueAction(true, null)).toBe('open')
  expect(issueAction(true, 123)).toBe('update')
})

test('ignores punctuation, capitalization and whitespace changes', () => {
  expect(
    decide(
      fingerprint('The same words, with punctuation!'),
      fingerprint('THE same   words with punctuation'),
      0,
    ).alert,
  ).toBe(false)
})

test('asks for review when a new Reading has no baseline', () => {
  expect(
    decide(
      undefined,
      fingerprint('A new reading without a reviewed baseline'),
      0,
    ).alert,
  ).toBe(true)
})

test('extracts article paragraphs without navigation, adverts or scripts', () => {
  const text = 'A paragraph explaining a relationship study. '.repeat(20).trim()
  const html = `<html><body><nav><p>Menu</p></nav><main><article><p>${text}</p><aside><p>Advert</p></aside><script>tracking()</script></article></main><footer><p>Legal</p></footer></body></html>`
  expect(extractText(html)).toBe(text)
  expect(() =>
    extractText('<html><body><p>Verify you are human</p></body></html>'),
  ).toThrow('Too little article text')
})
