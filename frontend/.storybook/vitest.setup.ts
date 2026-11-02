// Before the stories test (`src/platform/storybook/stories.browser.test.tsx`):
// the Storybook preview, with the site's styles.
import { setProjectAnnotations } from '@storybook/react-vite'
import { beforeAll } from 'vite-plus/test'
import { preloadPlot, wantPlot } from '../src/ui/visual-chart-loader'
import preview from './preview'

const annotations = setProjectAnnotations(preview)
beforeAll(annotations.beforeAll)
// The plot's chunk arrives on its own time. Fetched by a chart's story, it can
// land during a later story's `act` and fail that one with React's warning.
beforeAll(async () => {
  wantPlot()
  await preloadPlot()
})
