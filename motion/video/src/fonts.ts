import { continueRender, delayRender, staticFile } from 'remotion'

const FONTS: [string, string, string][] = [
  ['Bricolage Grotesque', 'bricolage-grotesque-latin-wght-normal.woff2', '200 800'],
  ['Atkinson Hyperlegible', 'atkinson-hyperlegible-latin-400-normal.woff2', '400'],
  ['Atkinson Hyperlegible', 'atkinson-hyperlegible-latin-700-normal.woff2', '700'],
  ['Kalam', 'kalam-latin-400-normal.woff2', '400'],
]

const handle = delayRender('fonts')
Promise.all(
  FONTS.map(async ([family, file, weight]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, { weight })
    document.fonts.add(await face.load())
  }),
).then(() => continueRender(handle))
