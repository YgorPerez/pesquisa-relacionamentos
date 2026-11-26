// Counts in the First Dates Dataset CSV (figshare 20219411, the only file of
// the item, md5 234b66b3101f5f45ccf73d3f3d2374f1), kept next to the local
// source in sources/private/. Each row is one line of speech; `id` names the
// date and `label` is 1 for a successful date and 0 for an unsuccessful one.
// Prints the lines, the dates, the successful dates and the unsuccessful ones.
//
//   node scripts/calculations/kinch-2022-first-dates.ts
import { readFileSync } from 'node:fs'

const rows = readFileSync('sources/private/kinch-2022-first-dates.csv', 'utf8')
  .replace(/^﻿/, '')
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => {
    const fields = line.split(',')
    return { id: fields[0], label: fields[fields.length - 1] }
  })

const outcome = new Map(rows.map((r) => [r.id, r.label]))
const success = [...outcome.values()].filter((l) => l === '1').length
const failure = [...outcome.values()].filter((l) => l === '0').length
console.log(`${rows.length} ${outcome.size} ${success} ${failure}`)
