import { defineConfig } from 'vite-plus'

export default defineConfig({
  test: {
    // O piso é a cobertura de quando ele entrou (ADR 0005): sobe com ela,
    // nunca desce.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json'],
      include: ['src/**'],
      thresholds: { statements: 96, branches: 87, functions: 100, lines: 97 },
    },
  },
})
