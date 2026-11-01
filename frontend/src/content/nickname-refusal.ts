// Why `/auth/nickname` sent the reader back to `/conta`, in the address's
// `?recusa=` (`platform/accounts.ts`, `routes/conta.tsx`).
export const NICKNAME_INVALID = 'apelido-invalido'
export const NICKNAME_TAKEN = 'apelido-em-uso'
export type NicknameRefusal = typeof NICKNAME_INVALID | typeof NICKNAME_TAKEN
