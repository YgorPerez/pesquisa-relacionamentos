import { defineConfig } from 'vite-plus'
import { vitestWorkers } from '../../scripts/machine-queue.ts'

// The run joins the machine queue before starting and takes the workers it
// gets (`scripts/machine-queue.ts`, ADR 0013).
const workers = await vitestWorkers()

export default defineConfig({
  test: {
    ...(workers ? { maxWorkers: workers } : {}),
    // The floor is the coverage from when it came in (ADR 0005): it rises
    // with it, never drops.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json'],
      include: ['src/**'],
      thresholds: { statements: 96, branches: 87, functions: 100, lines: 96 },
    },
  },
})
