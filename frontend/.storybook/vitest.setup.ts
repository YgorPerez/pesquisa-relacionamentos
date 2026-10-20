// Before the stories test (`src/platform/storybook/stories.browser.test.tsx`):
// the Storybook preview, with the site's styles.
import { setProjectAnnotations } from '@storybook/react-vite'
import { beforeAll } from 'vite-plus/test'
import preview from './preview'

const annotations = setProjectAnnotations(preview)
beforeAll(annotations.beforeAll)
