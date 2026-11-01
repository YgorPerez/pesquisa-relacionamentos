// What a form about login methods sent the reader back to `/conta` with, in the
// address's `?metodo=` (`platform/accounts.ts`, `routes/conta.tsx`).
const METHOD_DONE = [
  'google-ligado',
  'email-enviado',
  'email-ligado',
  'senha-trocada',
  'metodo-removido',
] as const
const METHOD_REFUSED = [
  'google-em-uso',
  'google-falhou',
  'email-em-uso',
  'email-invalido',
  'email-nao-enviado',
  'senha-errada',
  'senha-curta',
  'ultimo-metodo',
  'perde-curadoria',
  'muitas-tentativas',
  'indisponivel',
] as const
type MethodDone = (typeof METHOD_DONE)[number]
type MethodRefused = (typeof METHOD_REFUSED)[number]
export type MethodNotice = MethodDone | MethodRefused

export const isMethodNotice = (value: unknown): value is MethodNotice =>
  [...METHOD_DONE, ...METHOD_REFUSED].some((notice) => notice === value)
export const isMethodRefusal = (notice: MethodNotice) =>
  METHOD_REFUSED.some((refused) => refused === notice)

/** What `/conta` may know about the methods: the reader's own email, and never
 * the Google subject. */
export type AccountMethods = {
  google: boolean
  email: string | null
  /** The address waiting for its confirmation link. */
  pendingEmail: string | null
  canLinkGoogle: boolean
  canChangePassword: boolean
  canAddEmail: boolean
  /** This account is the curator's, and only through its Google subject. */
  curator: boolean
}
