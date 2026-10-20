import { defineConfig } from 'vite-plus'
import { workersDoVitest } from '../../scripts/fila-da-maquina.ts'

// The run joins the machine queue before starting and takes the workers it
// gets (`scripts/fila-da-maquina.ts`, ADR 0013).
const workers = await workersDoVitest()

export default defineConfig({
  test: {
    ...(workers ? { maxWorkers: workers } : {}),
    // The floor is the coverage from when it came in (ADR 0005): it rises
    // with it, never drops.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json'],
      include: ['src/**'],
      thresholds: { statements: 97, branches: 90, functions: 98, lines: 98 },
    },
  },
})
