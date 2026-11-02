import {
  NICKNAME_INVALID,
  NICKNAME_TAKEN,
  type NicknameRefusal,
} from '#/content/nickname-refusal'

export const ACCOUNT_RULES =
  'Use um apelido que não identifique outra pessoa. Não publique dados pessoais seus ou de terceiros, ofensas, ameaças ou spam. O curador pode retirar comentários que desrespeitem estas regras.'
export const SYNC_EXPLANATION =
  'Quer levar seu Perfil, Requisitos, Prioridades, Grifos, Notas e Comentários privados enviados para outros aparelhos? Quem administra o servidor pode ler esses dados e ligá-los à sua conta. Ao juntar, os Grifos se somam e o Perfil, os Requisitos e as Prioridades ficam na versão mais recente. Se você recusar, nada é enviado.'
export const SYNC_DEVICE =
  'Esta conta já sincroniza em outro aparelho. Os dados deste aparelho só entram nela se você juntar.'
export const SYNC_DECLINED =
  'Você escolheu manter seus dados só no aparelho. Nada foi enviado à conta.'
export const SYNC_FAILED =
  'Não foi possível sincronizar agora. Seus dados continuam neste aparelho.'
export const SYNC_ACTIVE =
  'A sincronização está ligada neste aparelho. O que você tira daqui sai também dos outros aparelhos.'
export const SYNC_STOP_NOTE =
  'Parar não apaga o que já está na conta nem o que está neste aparelho. Excluir a conta apaga o que ela guarda.'
export const SYNC_LINK =
  'Um link recebido trocou dados neste aparelho. Eles ficam só aqui: a conta guarda a sua versão até você editá-los.'
export const ACCOUNT = {
  title: 'Sua conta',
  signOut: 'Sair da conta',
  signedInAs: (nickname: string) => `Você entrou como ${nickname}.`,
  leaving: 'Sair da conta mantém o que está salvo neste aparelho.',
  whatIsKept: 'Veja o que o site guarda.',
  syncTitle: 'Seus dados nos seus aparelhos',
  join: 'Juntar e sincronizar',
  keepHere: 'Manter só neste aparelho',
  backToAccount: 'Voltar aos dados da conta',
  stop: 'Parar neste aparelho',
  retry: 'Tentar de novo',
  nicknameTitle: 'Falta um passo: como você quer aparecer?',
  nicknameExplanation:
    'O apelido será público nos comentários que você publicar. Evite usar seu nome completo.',
  nickname: 'Apelido',
  adult: 'Declaro ter 18 anos ou mais',
  rules: 'Li e aceito as regras acima',
  ageNote: 'A idade é uma declaração sua; o site não a verifica.',
  createNickname: 'Criar apelido',
} as const
export const NICKNAME_REFUSAL: Record<NicknameRefusal, string> = {
  [NICKNAME_INVALID]:
    'Escolha um apelido de 2 a 40 caracteres, declare ter 18 anos ou mais e aceite as regras.',
  [NICKNAME_TAKEN]: 'Esse apelido já está em uso. Escolha outro.',
}
