// The app's `cn`: the one from the `cn` package, which joins classes with
// tailwind-merge semantics, knowing the scales the `@theme` of
// `ui/tokens.css` declares. Without this it does not recognize a name that is
// not Tailwind's, and read `text-label` as a text color.
//
// The tables come ready from `cn-tables.js`, which `pnpm cn:tables` generates
// from the `@theme`, so the browser does not compile them on the first call
// (the same as the Festival dos Macacos). `cn.test.ts` checks that each theme
// name is in the tables, and that they are the ones today's `styles.css`
// generates.

import { createCn } from 'cn/engine'
import tables from './cn-tables'

export const cn = createCn(tables)
