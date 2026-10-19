import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  // Cada story mora ao lado do componente dela.
  stories: ['../src/**/*.stories.tsx'],
  framework: {
    name: '@storybook/react-vite',
    // O `vite.config.ts` do app monta o TanStack Start e o nitro, e nenhum
    // dos dois sabe servir uma story. O Storybook lê o dele.
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
}

export default config
