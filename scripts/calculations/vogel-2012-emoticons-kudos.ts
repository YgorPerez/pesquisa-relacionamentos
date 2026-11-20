// Vogel & Mamani Sanchez (2012), CogInfoCom 2012, pp. 517-522.
//
//   node scripts/calculations/vogel-2012-emoticons-kudos.ts
//     1. Table VI, "pos" column: the share of the emoticons in kudoer posts
//        (0.719) and in non-kudoer posts (0.583) that were positive, as
//        percentages.
//     2. Table I: kudoer posts (18,540) over all posts left after the
//        exclusions (18,540 + 189,744 = 208,284), the base rate the text
//        gives as "the mean of kudoer posts (0.089)".
const POSITIVE_SHARE_KUDOER = 0.719
const POSITIVE_SHARE_NON_KUDOER = 0.583
const KUDOER_POSTS = 18_540
const NON_KUDOER_POSTS = 189_744

const percent = (x: number) => (x * 100).toFixed(1).replace('.', ',')

console.log(
  [
    `positive emoticons, kudoer posts: ${percent(POSITIVE_SHARE_KUDOER)}%`,
    `positive emoticons, non-kudoer posts: ${percent(POSITIVE_SHARE_NON_KUDOER)}%`,
    `posts: ${KUDOER_POSTS + NON_KUDOER_POSTS}, kudoer posts: ${KUDOER_POSTS}, kudoer share: ${percent(KUDOER_POSTS / (KUDOER_POSTS + NON_KUDOER_POSTS))}%`,
  ].join('\n'),
)
