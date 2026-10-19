import { defineConfig } from 'vite-plus'
import { workersDoVitest } from '../../scripts/fila-da-maquina.ts'

// A rodada entra na fila da máquina antes de começar e leva os workers que
// ela der (`scripts/fila-da-maquina.ts`, ADR 0010).
const workers = await workersDoVitest()

export default defineConfig({
  test: {
    ...(workers ? { maxWorkers: workers } : {}),
    // O piso é a cobertura de quando ele entrou (ADR 0005): sobe com ela,
    // nunca desce.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json'],
      include: ['src/**'],
      thresholds: { statements: 96, branches: 87, functions: 100, lines: 96 },
    },
  },
})
