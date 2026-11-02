// "Comentar" of the popover on selected text (#337): the texts the form and
// its tests share. The type labels are the issue's (`content/comment-kinds.ts`).

export const COMMENT = {
  kind: 'O que é?',
  text: 'Seu comentário',
  anonymous:
    'Anônimo: vai só o trecho, o link dele e o que você escrever. Só o curador lê.',
  /** On a device joined to an account, whose sent comment reaches the account
   * with its issue's number (ADR 0046). */
  joined:
    'Vai só o trecho, o link dele e o que você escrever, sem o seu apelido. Como este aparelho sincroniza, uma cópia com o número do envio fica na sua conta, e quem administra o servidor pode ligar uma à outra.',
  send: 'Enviar',
  sending: 'Enviando…',
  missingKind: 'Escolha o que é.',
  missingText: 'Escreva o comentário.',
  sent: 'Comentário enviado. Obrigado!',
  /** The notice's link to where the sent comment is kept. */
  seeSent: 'Ver em Seus trechos',
  failed:
    'Não deu para enviar. O seu texto continua aqui; tente de novo daqui a pouco.',
  /** The honeypot's name, which a bot fills and a reader never sees. */
  honeypot: 'Site',
} as const
