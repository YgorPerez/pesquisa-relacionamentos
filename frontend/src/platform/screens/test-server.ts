// The screen tests' `@tanstack/react-start` (ADR 0035). On the site, the
// Start plugin swaps each `createServerFn` for a request to the server, which
// runs the `handler` there. In jsdom there is no server nor plugin: here the
// `handler` runs inside the test itself, over the real library and data (the
// `acervo()` and `grupoPossivel()` plugins of `vite.config.ts`), with the
// `validator` in front, as on the server. The response goes through a
// `structuredClone`, as it would through the wire: the screen does not get
// the object the server kept.
//
// Only what the app uses: `createServerFn({ method }).validator(v).handler(h)`.

type Options = { readonly data?: unknown }
type Handler = (context: { data: unknown }) => unknown

export function createServerFn(_options?: { method?: string }) {
  const withValidator = (validate: (data: unknown) => unknown) => ({
    handler: (handler: Handler) => serverFunction(validate, handler),
  })
  return {
    validator: withValidator,
    handler: (handler: Handler) => serverFunction((data) => data, handler),
  }
}

const serverFunction =
  (validate: (data: unknown) => unknown, handler: Handler) =>
  async (options?: Options) =>
    structuredClone(await handler({ data: validate(options?.data) }))
