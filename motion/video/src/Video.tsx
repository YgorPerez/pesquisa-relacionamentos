import type { CSSProperties, ReactNode } from 'react'
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import {
  CAPTIONS,
  CLIP1,
  CLIP2,
  END_LEN,
  END_START,
  EVENTS,
  FPS,
  frameOf,
  INTRO,
  LEN1,
  LEN2,
  START1,
  START2,
  TOTAL,
} from './timeline'

const PAPER = '#f5f8f8'
const INK = '#1a1c1c'
const INK2 = '#414948'
const YELLOW = '#ecd36f'
const DISPLAY = '"Bricolage Grotesque", sans-serif'
const BODY = '"Atkinson Hyperlegible", sans-serif'
const HAND = 'Kalam, cursive'

// The phone: a 390 × 844 screen shown at 700 px wide.
const S = 700 / 390
const SCREEN = { w: 700, h: Math.round(844 * S) }
const BEZEL = 22
const PHONE = { x: (1080 - SCREEN.w) / 2 - BEZEL, y: 330 }

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** The site's hand-drawn yellow marker, painted left to right by `p`. */
function Marker({ p, children, style }: { p: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ position: 'relative', whiteSpace: 'nowrap', zIndex: 0, ...style }}>
      <svg
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          zIndex: -1,
          left: '-0.12em',
          right: '-0.14em',
          top: '12%',
          bottom: '-4%',
          width: 'calc(100% + 0.26em)',
          height: '92%',
          clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
        }}
      >
        <path
          d="M4 8C50 6 130 7 196 5l1 8-1 9 1 9-3 3C130 33 60 33 5 35l-2-8 1-9-1-8z"
          fill={YELLOW}
        />
      </svg>
      {children}
    </span>
  )
}

function Background() {
  return (
    <AbsoluteFill
      style={{
        background: PAPER,
        backgroundImage: `radial-gradient(${INK}14 1.6px, transparent 1.6px)`,
        backgroundSize: '34px 34px',
      }}
    />
  )
}

/** "Agora dá pra grifar." alone, then up and away as the phone comes. */
function Intro() {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame: f, fps, config: { damping: 16 } })
  const leave = interpolate(f, [INTRO - 10, INTRO + 6], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  })
  const sweep = interpolate(f, [10, 24], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 1 - leave,
        transform: `translateY(${(1 - enter) * 80 - leave * 260}px)`,
      }}
    >
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 44, color: INK2, marginBottom: 18 }}>
        Novo no Tem estudo?
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 132,
          lineHeight: 1.02,
          letterSpacing: '-0.03em',
          color: INK,
          textAlign: 'center',
        }}
      >
        Agora dá pra
        <br />
        <Marker p={sweep}>grifar.</Marker>
      </div>
    </AbsoluteFill>
  )
}

/** The caption over the phone, its last words marked. */
function Caption({ lead, mark, len }: { lead: string; mark: string; len: number }) {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame: f, fps, config: { damping: 14, mass: 0.7 } })
  const out = interpolate(f, [len - 6, len], [0, 1], clamp)
  const sweep = interpolate(f, [5, 17], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })
  return (
    <AbsoluteFill
      style={{
        top: 92,
        height: 200,
        alignItems: 'center',
        opacity: enter * (1 - out),
        transform: `translateY(${(1 - enter) * 40 - out * 20}px)`,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 92,
          letterSpacing: '-0.025em',
          color: INK,
          whiteSpace: 'nowrap',
        }}
      >
        {lead} <Marker p={sweep}>{mark}</Marker>
      </div>
    </AbsoluteFill>
  )
}

/** The camera on the phone: still, or pushed in on what the finger does. */
function camera(frame: number) {
  const e = (type: string, label?: string) =>
    EVENTS.find((v) => v.type === type && (!label || v.label === label))!.t
  // [from, to] in recording seconds, the zoom, and the screen's y in CSS px kept in place.
  const shots: [number, number, number, number][] = [
    [e('press') - 0.1, e('nota-start') + 3.4, 1.28, 470],
    [e('comentar-start') + 0.3, e('enviado') + 0.8, 1.28, 640],
  ]
  let z = 1
  let y = 470
  for (const [a, b, zoom, fy] of shots) {
    const fa = frameOf(a)
    const fb = frameOf(b)
    const p = interpolate(frame, [fa, fa + 14, fb - 12, fb], [0, 1, 1, 0], {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    })
    if (p > 0) {
      z = 1 + (zoom - 1) * p
      y = fy
    }
  }
  return { z, originY: PHONE.y + BEZEL + y * S }
}

/** A finger: a soft dot that comes down, presses and leaves a ring. */
function Touches() {
  const f = useCurrentFrame()
  const dots: ReactNode[] = []
  EVENTS.forEach((ev, i) => {
    if (ev.type === 'tap') {
      const at = frameOf(ev.t)
      if (f < at - 9 || f > at + 14) return
      const show = interpolate(f, [at - 9, at - 3, at + 6, at + 14], [0, 1, 1, 0], clamp)
      const press = interpolate(f, [at - 3, at, at + 4], [1, 0.8, 1], clamp)
      const ring = interpolate(f, [at, at + 14], [0, 1], clamp)
      dots.push(<Dot key={i} x={ev.x!} y={ev.y!} o={show} s={press} ring={ring} />)
    }
    if (ev.type === 'press') {
      const rel = EVENTS.slice(i).find((v) => v.type === 'release')!
      const a = frameOf(ev.t)
      const b = frameOf(rel.t)
      if (f < a - 8 || f > b + 10) return
      const show = interpolate(f, [a - 8, a - 2, b + 2, b + 10], [0, 1, 1, 0], clamp)
      // Hold to start the selection, then drag along the lines to its end.
      const p = interpolate(f, [a + 6, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) })
      const press = interpolate(f, [a - 2, a + 4], [1, 0.8], clamp)
      const ring = interpolate(f, [a, a + 14], [0, 1], clamp)
      const lines = Math.max(1, Math.round((rel.y! - ev.y!) / 27) + 1)
      // Zigzag across each line, like a thumb sweeping the text.
      const line = Math.min(lines - 1, Math.floor(p * lines))
      const inLine = p * lines - line
      const lastLine = line === lines - 1
      const xEnd = lastLine ? rel.x! : 360
      const x = ev.x! + (xEnd - ev.x!) * Math.min(1, inLine)
      const y = ev.y! + line * 27
      dots.push(<Dot key={i} x={x} y={y} o={show} s={press} ring={ring} />)
    }
  })
  return <>{dots}</>
}

function Dot({ x, y, o, s, ring }: { x: number; y: number; o: number; s: number; ring: number }) {
  const left = PHONE.x + BEZEL + x * S
  const top = PHONE.y + BEZEL + y * S
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: left - 60,
          top: top - 60,
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: `5px solid ${INK}`,
          opacity: o * (1 - ring) * 0.5,
          transform: `scale(${0.5 + ring * 0.9})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: left - 42,
          top: top - 42,
          width: 84,
          height: 84,
          borderRadius: '50%',
          background: 'rgba(26,28,28,0.28)',
          border: '4px solid rgba(255,255,255,0.9)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          opacity: o,
          transform: `scale(${s})`,
        }}
      />
    </>
  )
}

function Phone() {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame: f - (INTRO - 16), fps, config: { damping: 18, mass: 0.9 } })
  const leave = interpolate(f, [END_START - 4, END_START + 14], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  })
  const { z, originY } = camera(f)
  // A short white flash hides the jump from the Guide to /grifos.
  const flash = interpolate(f, [START2 - 4, START2, START2 + 6], [0, 1, 0], clamp)
  return (
    <AbsoluteFill
      style={{
        transform: `translateY(${(1 - enter) * 2100 + leave * 2100}px) scale(${z})`,
        transformOrigin: `540px ${originY}px`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: PHONE.x,
          top: PHONE.y,
          width: SCREEN.w + BEZEL * 2,
          height: SCREEN.h + BEZEL * 2,
          borderRadius: 92,
          background: INK,
          boxShadow: '0 40px 90px rgba(26,28,28,0.35), 0 8px 24px rgba(26,28,28,0.25)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: PHONE.x + BEZEL,
          top: PHONE.y + BEZEL,
          width: SCREEN.w,
          height: SCREEN.h,
          borderRadius: 70,
          overflow: 'hidden',
          background: PAPER,
        }}
      >
        <Sequence from={START1} durationInFrames={LEN1} layout="none">
          <OffthreadVideo
            src={staticFile('flow.mp4')}
            startFrom={Math.round(CLIP1.from * FPS)}
            playbackRate={CLIP1.rate}
            muted
            style={{ width: SCREEN.w, height: SCREEN.h }}
          />
        </Sequence>
        <Sequence from={START2} layout="none">
          <OffthreadVideo
            src={staticFile('flow.mp4')}
            startFrom={Math.round(CLIP2.from * FPS)}
            playbackRate={CLIP2.rate}
            muted
            style={{ width: SCREEN.w, height: SCREEN.h }}
          />
        </Sequence>
        <AbsoluteFill style={{ background: PAPER, opacity: flash }} />
      </div>
      <Touches />
    </AbsoluteFill>
  )
}

/** The paper behind the captions, so the zoomed phone slides under them. */
function CaptionBand() {
  return (
    <AbsoluteFill
      style={{
        height: 330,
        background: `linear-gradient(${PAPER} 78%, ${PAPER}00)`,
      }}
    />
  )
}

function End() {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const a = spring({ frame: f - 4, fps, config: { damping: 15 } })
  const b = spring({ frame: f - 12, fps, config: { damping: 15 } })
  const sweep = interpolate(f, [18, 32], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', gap: 34 }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 150,
          letterSpacing: '-0.03em',
          color: INK,
          opacity: a,
          transform: `translateY(${(1 - a) * 60}px)`,
        }}
      >
        Tem estudo?
      </div>
      <div
        style={{
          fontFamily: HAND,
          fontSize: 62,
          color: INK2,
          opacity: b,
          transform: `translateY(${(1 - b) * 40}px) rotate(-2deg)`,
        }}
      >
        grife, anote, comente
      </div>
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 700,
          fontSize: 58,
          color: INK,
          marginTop: 30,
          opacity: b,
        }}
      >
        <Marker p={sweep}>temestudo.cloud</Marker>
      </div>
    </AbsoluteFill>
  )
}

export function Video() {
  return (
    <AbsoluteFill>
      <Background />
      <Sequence durationInFrames={INTRO + 8}>
        <Intro />
      </Sequence>
      <Phone />
      <CaptionBand />
      {CAPTIONS.map((c) => {
        const from = Math.round(c.from)
        const len = Math.round(c.to) - from
        return (
          <Sequence key={c.mark} from={from} durationInFrames={len}>
            <Caption lead={c.lead} mark={c.mark} len={len} />
          </Sequence>
        )
      })}
      <Sequence from={END_START} durationInFrames={END_LEN}>
        <End />
      </Sequence>
      <Audio src={staticFile('soundtrack.wav')} />
    </AbsoluteFill>
  )
}

export { TOTAL }
