// The types of a Comentário (#337), shared by the form
// (`ui/selection-comment.tsx`) and the issue it becomes (`comment-issue.ts`):
// the label shown on the form is the label of the issue in the private repo.

export const COMMENT_KINDS = [
  'wrong',
  'missing-study',
  'unclear',
  'other',
] as const
export type CommentKind = (typeof COMMENT_KINDS)[number]

export const KIND_LABEL: Readonly<Record<CommentKind, string>> = {
  wrong: 'Está errado',
  'missing-study': 'Falta estudo',
  unclear: 'Não entendi',
  other: 'Outro',
}

/** The most each field may carry, in characters. The form caps the quote it
 * sends at `quote`. */
export const COMMENT_LIMITS = {
  text: 2000,
  quote: 1500,
  page: 200,
  link: 2000,
} as const
