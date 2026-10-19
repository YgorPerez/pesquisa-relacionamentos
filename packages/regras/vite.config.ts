import { defineConfig } from 'vite-plus'

export default defineConfig({
  test: {
    // O piso é a cobertura de quando ele entrou (ADR 0005): sobe com ela,
    // nunca desce.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json'],
      include: ['src/**'],
      thresholds: { statements: 97, branches: 90, functions: 98, lines: 98 },
    },
  },
})
