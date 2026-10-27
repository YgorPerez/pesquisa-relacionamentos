// "Comentar" of the popover on selected text (#337): the texts the form and
// its tests share. The type labels are the issue's (`content/comment-kinds.ts`).

export const COMMENT = {
  kind: 'O que é?',
  text: 'Seu comentário',
  anonymous:
    'Anônimo: vai só o trecho, o link dele e o que você escrever. Só o curador lê.',
  send: 'Enviar',
  sending: 'Enviando…',
  missingKind: 'Escolha o que é.',
  missingText: 'Escreva o comentário.',
  sent: 'Comentário enviado. Obrigado!',
  failed:
    'Não deu para enviar. O seu texto continua aqui; tente de novo daqui a pouco.',
  /** The honeypot's name, which a bot fills and a reader never sees. */
  honeypot: 'Site',
} as const
