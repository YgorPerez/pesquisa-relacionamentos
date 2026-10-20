// O que os testes de tela do Grupo possível leem: o número preso no topo e a
// linha de cada Requisito, achada pelo papel e pelo título dela.
import {
  REQUIREMENT_TITLE,
  type VisitorRequirement,
} from '@tem-estudo/rules/requirements'
import { screen, waitFor, within } from '@testing-library/react'
import { expect } from 'vite-plus/test'

/** A faixa do número preso no topo ("entre … e …"). */
export const faixa = () =>
  document.querySelector('[data-slot="gp-preso"] [data-slot="gp-faixa"]')
    ?.textContent ?? null

/** A linha de um Requisito: o grupo com o título dele ("Onde", "Idade"). */
export function requisito(id: VisitorRequirement | 'orientacao') {
  const linha = screen.getByRole('group', { name: REQUIREMENT_TITLE[id] })
  return Object.assign(within(linha), {
    /** O que a linha diz do Requisito ("23 a 34 anos"). */
    valor: () => linha.querySelector('[data-slot="gp-req-valor"]')?.textContent,
    /** Quanto ele encolhe o grupo ("soltar só este: ×2,1 (+…)"). */
    custo: () => linha.querySelector('[data-slot="gp-req-custo"]')?.textContent,
  })
}

/** Espera a conta dos Requisitos pedidos sair, diferente de `antes`, e
 * devolve a faixa nova. */
export async function contaNova(antes: string | null) {
  await waitFor(() => {
    expect(faixa()).not.toBe(antes)
    expect(document.querySelector('[data-slot="gp-preso"]')).toHaveAttribute(
      'aria-busy',
      'false',
    )
  })
  return faixa()
}
