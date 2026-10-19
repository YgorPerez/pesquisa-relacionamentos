import babel from '@rolldown/plugin-babel'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  // O React Compiler também, para a story renderizar como o site renderiza
  // (ADR 0003).
  plugins: [viteReact(), babel({ presets: [reactCompilerPreset()] })],
})
