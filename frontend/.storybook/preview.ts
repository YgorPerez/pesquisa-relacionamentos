import type { Preview } from '@storybook/react-vite'
import { withRouter } from '../src/platform/storybook/with-router'
// The tokens, the fonts and the site's base, as in the app.
import '../src/styles.css'

const preview: Preview = {
  // Every story inside a router: the Fact sheet, the Guide and the cards
  // have `Link`.
  decorators: [withRouter],
  parameters: {
    viewport: {
      options: {
        mobile: {
          name: 'Mobile 412×915',
          styles: { width: '412px', height: '915px' },
          type: 'mobile',
        },
      },
    },
  },
  initialGlobals: { viewport: { value: 'mobile' } },
}

export default preview
