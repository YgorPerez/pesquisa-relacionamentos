import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  // Cada story mora ao lado do componente dela. O título sai do caminho
  // (`ui/grupo-possivel`), sem acento: a busca tira o do que se digita
  // (`manager.ts`).
  stories: ['../src/**/*.stories.tsx'],
  // A imagem fixa das prévias de link (`og.png`), que a story das prévias
  // mostra como o app de mensagem a mostra.
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/react-vite',
    // O `vite.config.ts` do app monta o TanStack Start e o nitro, e nenhum
    // dos dois sabe servir uma story. O Storybook lê o dele.
    options: { builder: { viteConfigPath: '.storybook/vite.config.ts' } },
  },
}

export default config
