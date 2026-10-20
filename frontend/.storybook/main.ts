import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  // Each story lives next to its component. The title comes from the path
  // (`ui/possible-group`), without accents: the search strips them from what
  // is typed (`manager.ts`).
  stories: ['../src/**/*.stories.tsx'],
  // The fixed image of the link previews (`og.png`), which the previews
  // story shows as the messaging app shows it.
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/react-vite',
    // The app's `vite.config.ts` builds TanStack Start and nitro, and
    // neither knows how to serve a story. Storybook reads its own.
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
}

export default config
