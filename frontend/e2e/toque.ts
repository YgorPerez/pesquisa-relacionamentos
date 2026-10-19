// A suíte roda no celular e no desktop (`playwright.config.ts`). No celular
// o teste toca, como o visitante; no desktop, que não tem toque, clica.
import { test, type Locator } from '@playwright/test'

type Opcoes = Parameters<Locator['tap']>[0]

/** Toca no celular e clica no desktop. */
export async function tocar(alvo: Locator, opcoes?: Opcoes): Promise<void> {
  if (test.info().project.use.hasTouch) await alvo.tap(opcoes)
  else await alvo.click(opcoes)
}
