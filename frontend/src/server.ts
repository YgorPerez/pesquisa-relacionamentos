import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { comRegistro } from '#/platform/registro-do-pedido'

// O servidor do TanStack Start, com cada pedido registrado sem a query e
// toda resposta com `Referrer-Policy: strict-origin` (ADR 0001,
// `platform/registro-do-pedido.ts`).
export default createServerEntry({ fetch: comRegistro(handler.fetch) })
