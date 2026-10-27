// The soundtrack: a light 120 BPM groove (Fmaj7 Dm7 Bbmaj7 C) and the
// sounds of the video (finger taps, marker swipes, the "sent" ding), timed
// from the recording's events with the composition's math (src/timeline.ts).
// Writes video/public/soundtrack.wav, 48 kHz stereo.
import { readFileSync, writeFileSync } from 'node:fs'

const here = (p) => new URL(p, import.meta.url).pathname
const events = JSON.parse(readFileSync(here('./video/src/events.json'), 'utf8'))
const at = (type, label) =>
  events.find((e) => e.type === type && (!label || e.label === label)).t

// --- the timeline, as in src/timeline.ts ---
const FPS = 30
const INTRO = 38
const C1 = { from: at('grifar-start') - 0.1, to: at('grifos-start'), rate: 1.3 }
const C2 = { from: at('grifos-loaded') + 0.1, to: at('end') - 0.2, rate: 1.1 }
const LEN1 = Math.round(((C1.to - C1.from) * FPS) / C1.rate)
const START2 = INTRO + LEN1
const LEN2 = Math.round(((C2.to - C2.from) * FPS) / C2.rate)
const END_START = START2 + LEN2
const TOTAL = END_START + 70
const sec = (t) =>
  (t >= C2.from
    ? START2 + ((t - C2.from) * FPS) / C2.rate
    : INTRO + ((t - C1.from) * FPS) / C1.rate) / FPS

const SR = 48000
const DUR = TOTAL / FPS
const N = Math.ceil(DUR * SR)
const L = new Float32Array(N)
const R = new Float32Array(N)
const add = (i, v, pan = 0) => {
  if (i < 0 || i >= N) return
  L[i] += v * (1 - pan) * 0.5 * 2 ** 0.5
  R[i] += v * (1 + pan) * 0.5 * 2 ** 0.5
}
let seed = 7
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12)

function kick(t, g = 0.9) {
  let ph = 0
  for (let k = 0; k < 0.35 * SR; k++) {
    const s = k / SR
    ph += (2 * Math.PI * (45 + 95 * Math.exp(-s * 28))) / SR
    add(Math.round(t * SR) + k, Math.sin(ph) * Math.exp(-s * 9) * g)
  }
}
function clap(t, g = 0.32) {
  let lp = 0
  for (let k = 0; k < 0.22 * SR; k++) {
    const s = k / SR
    const n = noise()
    lp += 0.35 * (n - lp)
    const env = Math.exp(-s * 22) * (s < 0.02 ? 0.7 + 0.3 * Math.sin(s * 900) : 1)
    add(Math.round(t * SR) + k, (n - lp) * env * g)
  }
}
function hat(t, g = 0.09, pan = 0.3) {
  let prev = 0
  for (let k = 0; k < 0.05 * SR; k++) {
    const n = noise()
    const hp = n - prev
    prev = n
    add(Math.round(t * SR) + k, hp * Math.exp(-(k / SR) * 90) * g, pan)
  }
}
/** A round electric-piano-ish note. */
function keys(t, midi, len, g = 0.07, pan = 0) {
  const f = hz(midi)
  for (let k = 0; k < (len + 0.4) * SR; k++) {
    const s = k / SR
    const env = Math.min(1, s * 200) * Math.exp(-s * 3.2) * (s > len ? Math.exp(-(s - len) * 14) : 1)
    const v =
      Math.sin(2 * Math.PI * f * s + 0.6 * Math.sin(2 * Math.PI * f * 2 * s) * Math.exp(-s * 6)) +
      0.25 * Math.sin(2 * Math.PI * f * 3 * s) * Math.exp(-s * 8)
    add(Math.round(t * SR) + k, v * env * g, pan)
  }
}
function bass(t, midi, len, g = 0.22) {
  const f = hz(midi)
  for (let k = 0; k < len * SR; k++) {
    const s = k / SR
    const env = Math.min(1, s * 300) * Math.exp(-s * 2.5) * Math.min(1, (len - s) * 60)
    const v = Math.sin(2 * Math.PI * f * s) + 0.2 * Math.sin(4 * Math.PI * f * s)
    add(Math.round(t * SR) + k, v * env * g)
  }
}
function click(t, g = 0.22) {
  for (let k = 0; k < 0.03 * SR; k++) {
    const s = k / SR
    add(Math.round(t * SR) + k, (Math.sin(2 * Math.PI * 1900 * s) * 0.7 + noise() * 0.3) * Math.exp(-s * 260) * g)
  }
}
function swipe(t, len = 0.22, g = 0.07) {
  let bp = 0
  let lp = 0
  for (let k = 0; k < len * SR; k++) {
    const s = k / SR
    const n = noise()
    lp += 0.08 * (n - lp)
    bp += (0.05 + 0.4 * (s / len)) * (n - bp)
    const env = Math.sin((Math.PI * s) / len) ** 2
    add(Math.round(t * SR) + k, (bp - lp) * env * g, -0.4 + (0.8 * s) / len)
  }
}
function ding(t) {
  ;[84, 91].forEach((m, i) => {
    const f = hz(m)
    for (let k = 0; k < 1.2 * SR; k++) {
      const s = k / SR
      const v = Math.sin(2 * Math.PI * f * s) + 0.3 * Math.sin(2 * Math.PI * f * 2.76 * s) * Math.exp(-s * 6)
      add(Math.round((t + i * 0.09) * SR) + k, v * Math.exp(-s * 4) * Math.min(1, s * 400) * 0.12)
    }
  })
}

// --- the groove ---
const BEAT = 0.5
const CHORDS = [
  { root: 41, notes: [57, 60, 64, 67] }, // Fmaj7
  { root: 38, notes: [57, 60, 62, 65] }, // Dm7
  { root: 34, notes: [58, 62, 65, 69] }, // Bbmaj7
  { root: 36, notes: [55, 60, 64, 67] }, // C
]
const DRUMS_IN = INTRO / FPS - 0.15
const OUTRO = END_START / FPS
const lastBeat = Math.floor((DUR - 1.2) / BEAT)
for (let b = 0; b <= lastBeat; b++) {
  const t = b * BEAT
  const chord = CHORDS[Math.floor(b / 4) % 4]
  const beatInBar = b % 4
  // Keys: a held chord on the bar, stabs on the off-beats.
  if (beatInBar === 0)
    chord.notes.forEach((m, i) => keys(t, m, 1.6, 0.05, (i - 1.5) * 0.25))
  if (t >= DRUMS_IN) chord.notes.slice(1).forEach((m, i) => keys(t + BEAT / 2, m + 12, 0.12, 0.028, (i - 1) * 0.4))
  if (t < DRUMS_IN) continue
  kick(t, beatInBar === 0 ? 0.95 : 0.8)
  if (beatInBar === 1 || beatInBar === 3) clap(t)
  hat(t + BEAT / 2, 0.1, 0.35)
  hat(t, 0.045, -0.3)
  bass(t, chord.root, BEAT * 0.45)
  bass(t + BEAT / 2, chord.root + (beatInBar === 3 ? 7 : 12), BEAT * 0.4, 0.16)
}
// The last chord rings over the end card.
const endT = (lastBeat + 1) * BEAT
CHORDS[0].notes.forEach((m, i) => keys(endT, m, 1.4, 0.06, (i - 1.5) * 0.25))
kick(endT, 0.9)
bass(endT, 41, 1.0)

// --- the sounds ---
swipe(DRUMS_IN - 0.05, 0.45, 0.12) // the phone comes up
swipe(0.33 + 0.2, 0.2) // the intro's marker
for (const e of events) {
  if (e.type === 'tap') click(sec(e.t))
  if (e.type === 'press') click(sec(e.t), 0.12)
}
;[at('nota-start'), at('comentar-start')].forEach((t) => swipe(sec(t) + 0.17, 0.2))
swipe(START2 / FPS + 0.17, 0.2)
swipe(START2 / FPS - 0.12, 0.25, 0.08) // the cut to /grifos
ding(sec(at('enviado')) - 0.08)
swipe(OUTRO + 0.6, 0.2) // the end card's marker

// Fade in, fade out, soft limit, 16-bit WAV.
const fadeOut = 0.9
let peak = 0
for (let i = 0; i < N; i++) {
  const s = i / SR
  const g = Math.min(1, s / 0.05) * Math.min(1, (DUR - s) / fadeOut)
  L[i] = Math.tanh(L[i] * g * 1.1)
  R[i] = Math.tanh(R[i] * g * 1.1)
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
}
const norm = 0.89 / peak
const buf = Buffer.alloc(44 + N * 4)
buf.write('RIFF', 0)
buf.writeUInt32LE(36 + N * 4, 4)
buf.write('WAVEfmt ', 8)
buf.writeUInt32LE(16, 16)
buf.writeUInt16LE(1, 20)
buf.writeUInt16LE(2, 22)
buf.writeUInt32LE(SR, 24)
buf.writeUInt32LE(SR * 4, 28)
buf.writeUInt16LE(4, 32)
buf.writeUInt16LE(16, 34)
buf.write('data', 36)
buf.writeUInt32LE(N * 4, 40)
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(L[i] * norm * 32767), 44 + i * 4)
  buf.writeInt16LE(Math.round(R[i] * norm * 32767), 46 + i * 4)
}
writeFileSync(here('./video/public/soundtrack.wav'), buf)
console.log(`soundtrack: ${DUR.toFixed(2)} s, ${TOTAL} frames`)
