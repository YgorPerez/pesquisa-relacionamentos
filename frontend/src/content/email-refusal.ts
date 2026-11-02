import { NICKNAME_INVALID, NICKNAME_TAKEN } from './nickname-refusal'

// Why `/auth/login` or `/auth/register` refused a form: in JSON to the page that
// sent it with JavaScript, and in the address's `?entrar=` or `?criar=` without
// it (`platform/accounts.ts`, `routes/conta.tsx`).
export const EMAIL_INVALID = 'dados-invalidos'
export const PASSWORD_SHORT = 'senha-curta'
export const EMAIL_TAKEN = 'email-em-uso'
export const WRONG_LOGIN = 'senha-errada'
export const TOO_MANY_ATTEMPTS = 'muitas-tentativas'
export const EMAIL_UNAVAILABLE = 'indisponivel'
const EMAIL_REFUSALS = [
  EMAIL_INVALID,
  PASSWORD_SHORT,
  EMAIL_TAKEN,
  WRONG_LOGIN,
  TOO_MANY_ATTEMPTS,
  EMAIL_UNAVAILABLE,
  NICKNAME_INVALID,
  NICKNAME_TAKEN,
] as const
export type EmailRefusal = (typeof EMAIL_REFUSALS)[number]

export const isEmailRefusal = (value: unknown): value is EmailRefusal =>
  EMAIL_REFUSALS.some((refusal) => refusal === value)
