// O `@tanstack/react-start` dos testes de tela (ADR 0035). No site, o plugin
// do Start troca cada `createServerFn` por um pedido ao servidor, que roda o
// `handler` lá. No jsdom não há servidor nem plugin: aqui o `handler` roda no
// próprio teste, sobre o acervo e os dados de verdade (os plugins
// `acervo()` e `grupoPossivel()` do `vite.config.ts`), com o `validator` na
// frente, como no servidor. A resposta passa por um `structuredClone`, como
// passaria pelo fio: a tela não recebe o objeto que o servidor guardou.
//
// Só o que o app usa: `createServerFn({ method }).validator(v).handler(h)`.

type Opcoes = { readonly data?: unknown }
type Handler = (contexto: { data: unknown }) => unknown

export function createServerFn(_opcoes?: { method?: string }) {
  const comValidador = (validar: (dado: unknown) => unknown) => ({
    handler: (handler: Handler) => funcao(validar, handler),
  })
  return {
    validator: comValidador,
    handler: (handler: Handler) => funcao((dado) => dado, handler),
  }
}

const funcao =
  (validar: (dado: unknown) => unknown, handler: Handler) =>
  async (opcoes?: Opcoes) =>
    structuredClone(await handler({ data: validar(opcoes?.data) }))
