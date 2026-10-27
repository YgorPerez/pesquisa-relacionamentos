# The video of the Grifos

A 19 s vertical video (1080 × 1920) of the actions on selected text: a
finger selects a sentence of a Guide, grifa it, writes a Nota, comments on
another sentence, and ends on `/grifos`. The phone screen is the real site,
recorded in a headless Chrome. Remotion puts it in a phone frame with the
captions, the finger and the zoom; the soundtrack comes from a script. It
follows the Festival dos Macacos' `motion/`.

## Render it

With the repository installed (`pnpm install` at the root), from the root:

```sh
node motion/make-video.mjs
```

It installs Remotion in `motion/video` the first time (`npm ci`), copies the
fonts from `frontend/src/fonts/`, writes the soundtrack (`music.mjs`),
renders, and leaves `motion/tem-estudo-grifos.mp4`.

## Record the screen again

The recording is in git (`video/public/flow.mp4`), with the time and place
of each touch in `video/src/events.json`. After a change to the screens:

1. `pnpm build`, then `node scripts/dev.ts start` with no
   `COMMENT_GITHUB_TOKEN`.
2. `FFMPEG=<full ffmpeg> node motion/record.mjs`. Playwright's full
   Chromium (`pnpm --dir frontend exec playwright install chromium`)
   records at about 40 fps; the headless shell drops to about 20.
3. `node motion/make-video.mjs`.

The recorder makes two Grifos off camera so `/grifos` has a list. The
comment is never sent: the server has no token, and the recorder turns its
"not sent" into "sent" for the camera (`flow.mjs`). `node motion/flow.mjs
--shots` runs the flow once, with a screenshot per step.

## Where to change things

- `video/src/timeline.ts`: which part of the recording plays, how fast, and
  the captions.
- `video/src/Video.tsx`: the title, the phone, the finger, the zoom and the
  end card.
- `record.mjs`: what the finger does on the site.
- `music.mjs`: the groove and the sounds.
