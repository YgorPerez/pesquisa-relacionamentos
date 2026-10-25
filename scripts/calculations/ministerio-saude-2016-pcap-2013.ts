// PCAP 2013: share of the sexually active population with more than ten
// sexual partners in their lifetime.
//
// The report's 43.9% has as its base the people who answered "yes" to "more
// than one partner in your lifetime?" (question 2 of the self-completed part
// leads to question 3). The report gives 69.2% for "more than one partner"
// among the sexually active, so the share of all sexually active people with
// more than ten partners is 43.9% x 69.2%.
//
//   node scripts/calculations/ministerio-saude-2016-pcap-2013.ts
import { spawnSync } from 'node:child_process'

const pdf = 'sources/private/ministerio-saude-2016-pcap-2013.pdf'
const r = spawnSync('pdftotext', ['-enc', 'UTF-8', pdf, '-'], {
  encoding: 'utf8',
})
if (r.status !== 0) throw new Error(`pdftotext failed on ${pdf}: ${r.stderr}`)
const text = r.stdout.replace(/\s+/g, ' ')

const match =
  /mais de uma parceria sexual na vida foi de (\d+,\d)%, e (\d+,\d)% declararam ter tido mais de dez parcerias/.exec(
    text,
  )
if (!match)
  throw new Error('the sentence with 69,2% and 43,9% is not in the source')
const pct = (s: string) => Number(s.replace(',', '.'))
const moreThanOne = pct(match[1] ?? '')
const moreThanTenAmongThem = pct(match[2] ?? '')

const share = (moreThanOne * moreThanTenAmongThem) / 100
console.log(share.toFixed(1).replace('.', ','))
