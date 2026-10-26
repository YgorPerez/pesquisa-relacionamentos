// The share image's copy (`share-image.tsx`), which its test also reads.
// Outside the `.tsx`, which only exports components.

/** Each format's button and the name of the file it makes. */
export const IMAGE_FORMATS = {
  square: { label: 'Imagem quadrada', file: 'grupo-possivel-quadrada.png' },
  story: { label: 'Imagem para stories', file: 'grupo-possivel-stories.png' },
} as const

/** What the image shows and what it leaves out, under the buttons. */
export const IMAGE_NOTE =
  'A imagem mostra o número, quem você procura e os seus Requisitos. Seu gênero e sua idade ficam de fora.'

/** The status after a try, where the share sheet does not take over. */
export const IMAGE_OUTCOME = {
  downloaded: 'Imagem baixada.',
  failed: 'Não deu para gerar a imagem.',
} as const
