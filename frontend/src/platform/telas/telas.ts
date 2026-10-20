// O que todo `.test.tsx` precisa antes de abrir uma tela no jsdom (ADR
// 0031): os matchers do jest-dom (`toBeVisible`, `toHaveAccessibleName`…), a
// rede de mentira ligada (`./rede.ts`), e a tela desmontada e o aparelho
// limpo depois de cada teste. A Testing Library só desmonta sozinha com os
// globais do Vitest ligados, e aqui eles não estão.
//
// Um erro ou aviso no console falha o teste, como nas stories: o React avisa
// assim de uma chave repetida, de um `act` esquecido, de um HTML mal aninhado.
import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import {
  afterAll,
  afterEach,
  beforeEach,
  vi,
  type MockInstance,
} from 'vite-plus/test'
import { servidor } from './rede'

// O `findBy*` e o `waitFor` desistem em 10 s, e não em 1: a primeira tela de
// um arquivo compila a rota dentro dessa espera. Uma espera que acha o que
// procura não demora mais por isso. Por isso também o `vi.waitFor`, que
// desiste em 1 s, não entra num teste de tela
// (`frontend/lint/sem-vi-waitfor-nas-telas.ts`).
configure({ asyncUtilTimeout: 10_000 })

servidor.listen({ onUnhandledFrame: 'error' })

// O jsdom não rola: a página que abre no topo chamaria um `scrollTo` que ele
// só anuncia como "não implementado".
let espias: MockInstance[] = []
beforeEach(() => {
  window.scrollTo = () => {}
  espias = [vi.spyOn(console, 'error'), vi.spyOn(console, 'warn')]
})

afterEach(() => {
  cleanup()
  servidor.resetHandlers()
  localStorage.clear()
  sessionStorage.clear()
  const ditos = espias.flatMap((espia) =>
    espia.mock.calls.map((chamada) => chamada.map(String).join(' ')),
  )
  vi.restoreAllMocks()
  if (ditos.length > 0)
    throw new Error(`a tela escreveu no console:\n${ditos.join('\n')}`)
})

afterAll(() => servidor.close())
