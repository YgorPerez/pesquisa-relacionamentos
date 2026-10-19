import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { redirecionamentos } from '@tem-estudo/conteudo/busca'
import acervo from 'virtual:acervo'
import { comRedirecionamentos } from '#/platform/redirecionamento'
import { comRegistro } from '#/platform/registro-do-pedido'

// O servidor do TanStack Start, com cada pedido registrado sem a query e
// toda resposta com `Referrer-Policy: strict-origin` (ADR 0001,
// `platform/registro-do-pedido.ts`). Antes do app, os 301 da barra final e
// do `antes` (`platform/redirecionamento.ts`).
export default createServerEntry({
  fetch: comRegistro(comRedirecionamentos(redirecionamentos(acervo), handler.fetch)),
})
