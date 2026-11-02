import {
  EMAIL_INVALID,
  EMAIL_TAKEN,
  EMAIL_UNAVAILABLE,
  PASSWORD_SHORT,
  TOO_MANY_ATTEMPTS,
  WRONG_LOGIN,
  type EmailRefusal,
} from '#/content/email-refusal'
import { NICKNAME_INVALID, NICKNAME_TAKEN } from '#/content/nickname-refusal'
import { NICKNAME_REFUSAL } from './account.copy'

export const ACCOUNT_INTRO =
  'Você pode ler tudo sem entrar. A conta serve para publicar comentários e levar seus dados para outros aparelhos.'
export const ENTRY = {
  google: 'Continuar com Google',
  googleNote:
    'Serve para entrar e para criar conta. Do Google, não guardamos seu nome, e-mail ou foto.',
  orEmail: 'ou com e-mail',
  loginTitle: 'Já tenho conta',
  login: 'Entrar com e-mail',
  emailLogin: 'E-mail para entrar',
  passwordLogin: 'Senha',
  forgot: 'Esqueci minha senha',
  noAccount: 'Ainda não tem conta?',
  toSignUp: 'Criar conta',
  signUpTitle: 'Criar conta',
  step: (number: number, name: string) => `Passo ${number} de 3: ${name}`,
  accessStep: 'e-mail e senha',
  nicknameStep: 'como você aparece',
  rulesStep: 'regras',
  emailRegister: 'E-mail para criar conta',
  emailKept: 'Guardamos o e-mail para login e recuperação de senha.',
  passwordRegister: 'Crie uma senha',
  passwordNote: 'Use pelo menos 8 caracteres.',
  next: 'Continuar',
  back: 'Voltar',
  register: 'Criar conta com e-mail',
} as const
export const EMAIL_REFUSAL: Record<EmailRefusal, string> = {
  [EMAIL_INVALID]: 'Confira o e-mail e a senha.',
  [PASSWORD_SHORT]: 'A senha precisa ter pelo menos 8 caracteres.',
  [EMAIL_TAKEN]:
    'Esse e-mail já tem conta. Use “Esqueci minha senha” para recuperar o acesso.',
  [WRONG_LOGIN]: 'E-mail ou senha incorretos.',
  [TOO_MANY_ATTEMPTS]: 'Muitas tentativas. Espere 15 minutos e tente de novo.',
  [EMAIL_UNAVAILABLE]:
    'Não deu para falar com o servidor agora. Tente de novo ou continue com Google.',
  [NICKNAME_INVALID]: NICKNAME_REFUSAL[NICKNAME_INVALID],
  [NICKNAME_TAKEN]: NICKNAME_REFUSAL[NICKNAME_TAKEN],
}
