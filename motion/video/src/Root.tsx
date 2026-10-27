import { Composition } from 'remotion'
import './fonts'
import { FPS, H, TOTAL, W } from './timeline'
import { Video } from './Video'

export const Root = () => (
  <Composition id="Grifos" component={Video} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
)
