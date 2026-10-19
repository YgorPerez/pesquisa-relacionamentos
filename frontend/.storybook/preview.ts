import type { Preview } from '@storybook/react-vite'
// Os tokens, as fontes e a base do site, como no app.
import '../src/styles.css'

const preview: Preview = {
  parameters: {
    viewport: {
      options: {
        celular: {
          name: 'Celular 412×915',
          styles: { width: '412px', height: '915px' },
          type: 'mobile',
        },
      },
    },
  },
  initialGlobals: { viewport: { value: 'celular' } },
}

export default preview
