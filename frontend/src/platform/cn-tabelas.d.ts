// O `cn build` gera as tabelas em JS (`cn-tabelas.js`, `pnpm cn:tabelas`). O
// tipo é o que o `createCn` recebe.

import type { createCn } from 'cn/engine'

declare const tabelas: Parameters<typeof createCn>[0]
export default tabelas
