// The share image (#302) on the Possible group screen, in jsdom. jsdom has
// no canvas: a fake 2D context writes down the text the image draws, which
// is what the test checks (what the image says, never the sharer's gender or
// age). How it looks belongs to the story and the screen captures.
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test'
import { openScreen } from '#/platform/screens/open-screen'
import { newCount, range } from '#/platform/screens/possible-group'
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
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function countForAMan() {
  const user = userEvent.setup()
  openScreen('/grupo-possivel')
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
  const share = vi.fn(async (_: ShareData) => {})
  vi.stubGlobal('navigator', {
    ...navigator,
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
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
  const user = await countForAMan()

  await user.click(screen.getByRole('button', { name: 'Imagem quadrada' }))

  expect(await screen.findByText('Não deu para gerar a imagem.')).toBeVisible()
})
