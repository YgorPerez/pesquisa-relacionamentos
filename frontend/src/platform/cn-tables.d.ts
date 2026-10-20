// `cn build` generates the tables in JS (`cn-tables.js`, `pnpm cn:tables`).
// The type is what `createCn` receives.

import type { createCn } from 'cn/engine'

declare const tables: Parameters<typeof createCn>[0]
export default tables
