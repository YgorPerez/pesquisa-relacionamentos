// Renders the video from the recording in git:
//
//   node motion/make-video.mjs
//
// Installs Remotion in motion/video the first time (`npm ci`; the folder is
// not in the pnpm workspace), copies the site's fonts, writes the
// soundtrack, renders, and moves the MP4's index to the front so WhatsApp
// plays it while it downloads. Out: motion/tem-estudo-grifos.mp4.
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs'
import { join } from 'node:path'

const here = (p) => new URL(p, import.meta.url).pathname
const video = here('./video/')

function run(cmd, args, cwd) {
  console.log(`\n> ${cmd} ${args.join(' ')}`)
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit' })
  if (r.status !== 0) throw new Error(`${cmd} ${args[0]} exited with ${r.status}`)
}

if (!existsSync(join(video, 'node_modules'))) run('npm', ['ci'], video)

const fonts = here('../frontend/src/fonts/')
mkdirSync(join(video, 'public/fonts'), { recursive: true })
for (const f of readdirSync(fonts).filter((f) => f.endsWith('.woff2')))
  copyFileSync(join(fonts, f), join(video, 'public/fonts', f))

run('node', [here('./music.mjs')])
run('npm', ['run', 'render'], video)

// The ffmpeg Remotion brings is enough to remux.
const compositor = readdirSync(join(video, 'node_modules/@remotion')).find((p) =>
  p.startsWith(`compositor-${process.platform}-${process.arch}`),
)
const ffmpeg = join(video, 'node_modules/@remotion', compositor, 'ffmpeg')
const rendered = here('./tem-estudo-grifos.mp4')
const temp = here('./tem-estudo-grifos.tmp.mp4')
run(ffmpeg, ['-loglevel', 'error', '-y', '-i', rendered, '-c', 'copy', '-movflags', '+faststart', temp])
renameSync(temp, rendered)
console.log('\nDone: motion/tem-estudo-grifos.mp4')
