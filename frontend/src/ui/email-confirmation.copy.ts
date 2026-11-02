export const EMAIL_CONFIRMATION = {
  title: 'Confirme seu e-mail',
  explanation: (email: string) =>
    `Confirme para ligar ${email} à sua conta. Depois disso, você também entra com este e-mail e a senha que criou.`,
  note: 'A confirmação encerra o acesso nos outros aparelhos. Este aparelho continua na conta.',
  submit: 'Confirmar e-mail',
  invalid: 'Este link expirou ou já foi usado. Peça outro na sua conta.',
  otherAccount:
    'Para confirmar, entre na conta que pediu este e-mail e abra o link de novo.',
  back: 'Ir para a sua conta',
}
