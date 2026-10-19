import type { Preview } from '@storybook/react-vite'
import { comRouter } from '../src/platform/storybook/com-router'
// Os tokens, as fontes e a base do site, como no app.
import '../src/styles.css'

const preview: Preview = {
  // Toda story dentro de um router: a Ficha, o Guia e os cartões têm `Link`.
  decorators: [comRouter],
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
