// The share image (#302) on the Possible group screen, in jsdom. jsdom has
// no canvas: a fake 2D context writes down the text the image draws, which
// is what the test checks (what the image says, never the sharer's gender or
// age). How it looks belongs to the story and the screen captures.
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'
import {
  newCount,
  openPossibleGroup,
  range,
  requirement,
} from '#/platform/screens/possible-group'
import { enterProfile } from '#/platform/screens/profile'

/** Every text the image drew, in order. */
let drawn: string[] = []

/** A 2D context that does nothing, measures each letter as 10px and writes
 * down `fillText`. */
function fakeContext() {
  const target: Record<string, unknown> = {
    measureText: (text: string) => ({ width: text.length * 10 }),
    fillText: (text: string) => drawn.push(text),
    createPattern: () => ({}),
  }
  return new Proxy(target, {
    get: (t, key: string) => (key in t ? t[key] : () => {}),
    set: (t, key: string, value) => {
      t[key] = value
      return true
    },
  })
}

beforeEach(() => {
  drawn = []
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => fakeContext() as unknown as CanvasRenderingContext2D,
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
    (done: BlobCallback) => done(new Blob(['png'], { type: 'image/png' })),
  )
  vi.stubGlobal('Path2D', class {})
})

afterEach(() => {
  Reflect.deleteProperty(navigator, 'canShare')
  Reflect.deleteProperty(navigator, 'share')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function countForAMan() {
  const user = userEvent.setup()
  openPossibleGroup()
  await screen.findByRole('form', { name: 'Seu Perfil' })
  const before = range()
  await enterProfile(
    user,
    { gender: 'homem', seeks: 'mulheres', age: '30' },
    'Usar na conta',
  )
  await newCount(before)
  return user
}

it("the phone's share sheet gets the square PNG, which shows who is sought and not who shares", async () => {
  // jsdom has no share sheet: this one takes files.
  const share = vi.fn<(data: ShareData) => Promise<void>>(async () => {})
  Object.assign(navigator, {
    canShare: (data: ShareData) => (data.files?.length ?? 0) > 0,
    share,
  })
  const user = await countForAMan()

  await user.click(screen.getByRole('button', { name: 'Imagem quadrada' }))

  await waitFor(() => expect(share).toHaveBeenCalledOnce())
  const [file] = share.mock.calls[0]![0].files!
  expect(file!.name).toBe('grupo-possivel-quadrada.png')
  expect(file!.type).toBe('image/png')
  const text = drawn.join(' ')
  expect(text).toMatch(/procuro\?/)
  expect(text).toMatch(/mulheres/)
  // Nor the age range taken from the Profile (30 ± 5). The count's numbers
  // may have any digit, so the check looks at the range's words.
  expect(text).toMatch(/na idade procurada/)
  expect(text).not.toMatch(/homem|homens|30 anos|25 a 35/)
})

it('without a share sheet, the story image downloads', async () => {
  const user = await countForAMan()
  // jsdom has no object URLs.
  URL.createObjectURL = () => 'blob:imagem'
  URL.revokeObjectURL = () => {}
  const downloads: string[] = []
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    downloads.push(this.download)
  })

  await user.click(screen.getByRole('button', { name: 'Imagem para stories' }))

  await waitFor(() => expect(downloads).toEqual(['grupo-possivel-stories.png']))
  expect(screen.getByText('Imagem baixada.')).toBeVisible()
})

it('without a canvas, it says the image did not come out', async () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  const user = await countForAMan()

  await user.click(screen.getByRole('button', { name: 'Imagem quadrada' }))

  expect(await screen.findByText('Não deu para gerar a imagem.')).toBeVisible()
})

it('a sensitive Requirement without consent stays out of the image, and so does its cut in the number', async () => {
  const share = vi.fn<(data: ShareData) => Promise<void>>(async () => {})
  Object.assign(navigator, { canShare: () => true, share })
  const user = await countForAMan()
  const first = range()
  const withoutIt = first!.replace(/^(cerca de|entre) /, '')
  await user.click(
    requirement('bisexual').getByRole('checkbox', {
      name: 'Só quem se declara bissexual',
    }),
  )
  const withIt = (await newCount(first))!.replace(/^(cerca de|entre) /, '')
  const imageText = async () => {
    drawn = []
    share.mockClear()
    await user.click(screen.getByRole('button', { name: 'Imagem quadrada' }))
    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    return drawn.join(' ')
  }

  const before = await imageText()
  expect(before).not.toMatch(/bissexual/)
  expect(before).toContain(withoutIt.split(' e ')[0])

  await user.click(
    screen.getByRole('checkbox', { name: 'Incluir no link: bissexual' }),
  )
  const after = await imageText()
  expect(after).toMatch(/bissexual/)
  expect(after).toContain(withIt.split(' e ')[0])
})

it('with only a detail-pack sensitive Requirement on and no consent, the image still comes out', async () => {
  // A fresh visit with the Requirements saved: the screen asks for the
  // detail packs (BMI lives there), and the link, without BMI, needs the
  // default ones, which nothing else on the page asks for.
  localStorage.setItem(
    'tem-estudo:profile',
    JSON.stringify({ gender: 'homem', seeks: 'mulheres', age: 30 }),
  )
  localStorage.setItem(
    'tem-estudo:requirements',
    JSON.stringify({ place: { state: 'AC' }, notObese: true }),
  )
  openPossibleGroup()

  expect(
    await screen.findByRole('button', { name: 'Imagem quadrada' }),
  ).toBeVisible()
})
