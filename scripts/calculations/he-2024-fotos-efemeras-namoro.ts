// He, Xu, Huang, Hong & Liu, "Enhancing User Privacy Through Ephemeral
// Sharing Design", SSRN 3740782 version (Information Systems Research).
//
//   node scripts/calculations/he-2024-fotos-efemeras-namoro.ts photos
//     Section 5.1.1 (p. 18): the effect on NumPhoto (0.111) over the control
//     group's mean (0.215), the relative increase the text gives as 52.1%.
//   node scripts/calculations/he-2024-fotos-efemeras-namoro.ts share
//     Table 3 (p. 16): mean NumPhoto (0.271) over mean NumRequest (5.877),
//     the share of matching requests that carried a photo, both groups.
const PHOTO_EFFECT = 0.111
const CONTROL_MEAN_PHOTOS = 0.215
const MEAN_PHOTOS = 0.271
const MEAN_REQUESTS = 5.877

const TEXT_INCREASE = 52.1
const comma = (x: number) => String(x).replace('.', ',')
const percent = (x: number) => `${(x * 100).toFixed(1).replace('.', ',')}%`

const which = process.argv[2]
if (which === 'photos')
  console.log(
    `${comma(PHOTO_EFFECT)} / ${comma(CONTROL_MEAN_PHOTOS)} = ${percent(PHOTO_EFFECT / CONTROL_MEAN_PHOTOS)} (texto: ${comma(TEXT_INCREASE)}%)`,
  )
else if (which === 'share')
  console.log(
    `${comma(MEAN_PHOTOS)} / ${comma(MEAN_REQUESTS)} = ${percent(MEAN_PHOTOS / MEAN_REQUESTS)}`,
  )
else {
  console.error('usage: he-2024-fotos-efemeras-namoro.ts photos|share')
  process.exit(1)
}
