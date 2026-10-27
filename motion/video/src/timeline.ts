// Where each piece of the recording lands in the video. Shared by the
// composition and by `../music.mjs`, which places the sounds.
import events from './events.json'

export const FPS = 30
export const W = 1080
export const H = 1920

export type Ev = {
  t: number
  type: string
  x?: number
  y?: number
  label?: string
}
export const EVENTS = events as Ev[]
const at = (type: string) => EVENTS.find((e) => e.type === type)!.t

/** The title alone, before the phone. */
export const INTRO = 38
/** The Guide: from just before the first drag to the move to /grifos. */
export const CLIP1 = { from: at('grifar-start') - 0.1, to: at('grifos-start'), rate: 1.3 }
/** /grifos, once loaded. */
export const CLIP2 = { from: at('grifos-loaded') + 0.1, to: at('end') - 0.2, rate: 1.1 }
export const START1 = INTRO
export const LEN1 = Math.round(((CLIP1.to - CLIP1.from) * FPS) / CLIP1.rate)
export const START2 = START1 + LEN1
export const LEN2 = Math.round(((CLIP2.to - CLIP2.from) * FPS) / CLIP2.rate)
export const END_START = START2 + LEN2
export const END_LEN = 70
export const TOTAL = END_START + END_LEN

/** The video frame that shows the recording's second `t`. */
export function frameOf(t: number): number {
  if (t >= CLIP2.from) return START2 + ((t - CLIP2.from) * FPS) / CLIP2.rate
  return START1 + ((t - CLIP1.from) * FPS) / CLIP1.rate
}

/** The captions, each from an event to the next caption. */
export const CAPTIONS = [
  { from: START1, lead: 'Selecione e', mark: 'grife' },
  { from: frameOf(at('nota-start')), lead: 'Escreva uma', mark: 'nota' },
  { from: frameOf(at('comentar-start')), lead: 'Viu um erro?', mark: 'Comente' },
  { from: START2, lead: 'Tudo em', mark: 'Seus grifos' },
].map((c, i, all) => ({ ...c, to: all[i + 1]?.from ?? END_START }))
