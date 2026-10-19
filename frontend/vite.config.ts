/// <reference types="vitest/config" />
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, type PluginOption } from 'vite'

// O Vitest só precisa do React: o Start e o nitro montam o servidor, que
// teste de unidade nenhum usa. O app inteiro é testado pelo Playwright,
// sobre o build (`playwright.config.ts`).
const plugins: PluginOption[] = process.env.VITEST
  ? [viteReact()]
  : [tanstackStart(), nitro(), viteReact()]

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins,
  test: {
    include: ['src/**/*.test.ts', 'nginx/**/*.test.ts', 'scripts/**/*.test.ts'],
    environment: 'node',
  },
})
