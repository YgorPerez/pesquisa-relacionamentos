import type { MethodNotice } from '#/content/method-notice'

export const LOGIN_METHODS = {
  title: 'Como você entra',
  sessions:
    'Ligar ou tirar um jeito de entrar encerra o acesso nos outros aparelhos. Este aparelho continua na conta.',
  googleOn: 'Google ligado.',
  googleOff: 'Google não ligado.',
  linkGoogle: 'Ligar Google',
  removeGoogle: 'Tirar Google',
  emailOn: 'E-mail ligado:',
  emailOff: 'Nenhum e-mail ligado.',
  removeEmail: 'Tirar e-mail',
  onlyOne:
    'Sua conta precisa de um jeito de entrar. Ligue outro para poder tirar este.',
  addTitle: 'Ligar um e-mail',
  addExplanation:
    'Vamos mandar um link para confirmar o endereço. Ele só entra na conta quando você abrir o link com esta conta aberta. Guardamos o e-mail para login e recuperação de senha.',
  addEmail: 'E-mail que vai ligar',
  addPassword: 'Crie uma senha para esse e-mail',
  addSubmit: 'Enviar link de confirmação',
  pending: (email: string) =>
    `Falta confirmar ${email}. O link vale por 30 minutos. Se errou o endereço, peça de novo: o link novo cancela o anterior.`,
  passwordTitle: 'Trocar a senha',
  passwordCurrent: 'Senha atual',
  passwordNew: 'Nova senha',
  passwordNote:
    'Use pelo menos 8 caracteres. A troca encerra o acesso nos outros aparelhos.',
  passwordSubmit: 'Trocar senha',
  curatorKeepsGoogle:
    'O Google desta conta não pode sair, porque é por ele que o site reconhece o curador. Sem ele, esta conta perderia a Curadoria, e entrar de novo com esse Google abriria outra conta, que viraria a do curador. Um e-mail ligado continua servindo para entrar.',
} as const

export const METHOD_NOTICE: Record<MethodNotice, string> = {
  'google-ligado': 'Google ligado. Os outros aparelhos saíram da conta.',
  'email-enviado':
    'Mandamos o link de confirmação. Confira também o spam. Abra o link com esta conta aberta.',
  'email-ligado':
    'E-mail confirmado. Agora você também entra com ele, e os outros aparelhos saíram da conta.',
  'senha-trocada': 'Senha trocada. Os outros aparelhos saíram da conta.',
  'metodo-removido':
    'Pronto, esse jeito de entrar saiu. Os outros aparelhos saíram da conta.',
  'google-em-uso':
    'Esse Google já tem conta própria aqui, e as contas não se juntam. Para ligá-lo a esta, exclua a outra antes.',
  'google-falhou':
    'Não deu para ligar o Google. Confira se esta é a conta certa e tente de novo.',
  'email-em-uso':
    'Esse e-mail já tem conta própria aqui, e as contas não se juntam. Use outro endereço, ou exclua a outra conta antes.',
  'email-invalido': 'Confira o e-mail e use uma senha de 8 a 1024 caracteres.',
  'email-nao-enviado':
    'O e-mail não saiu agora. Espere alguns minutos e tente de novo.',
  'senha-errada': 'A senha atual não confere.',
  'senha-curta': 'A nova senha precisa ter de 8 a 1024 caracteres.',
  'ultimo-metodo':
    'Sua conta precisa de um jeito de entrar. Ligue outro antes de tirar este.',
  'google-do-curador':
    'O Google continua ligado. Ele não pode sair da conta do curador, porque é por ele que o site reconhece o curador.',
  'muitas-tentativas': 'Muitas tentativas. Espere 15 minutos e tente de novo.',
  indisponivel: 'Isso está indisponível agora. Tente de novo mais tarde.',
}
