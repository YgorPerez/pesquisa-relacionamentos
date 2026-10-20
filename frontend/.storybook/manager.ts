// A busca da barra lateral procura nos títulos, que saem do caminho do arquivo
// (`ui/grupo-possivel.stories.tsx` vira `ui/grupo-possivel`) e por isso não
// têm acento: `possível` não acharia nada. Aqui o que se digita perde o
// acento antes de a busca ler, e `possível` procura `possivel`. Copiado do
// `manager.ts` do Festival dos Macacos (ADR 0037).
//
// O campo é do React, pelo Downshift do `Search.tsx` do Storybook. Este ouvinte
// fica no `document`, na captura, e roda antes do do React, que fica na raiz.
// O valor novo entra pelo setter do `HTMLInputElement`, e não por
// `campo.value`: o React vigia o `value` do elemento, e com o valor trocado por
// ali ele acharia que nada mudou e a busca continuaria com o acento.
//
// O teste é o `busca.e2e.ts`, contra o Storybook de verdade: um upgrade que
// troque o campo quebra o teste, e não a busca em silêncio.

const CAMPO = 'storybook-explorer-searchfield'

/** O setter do `HTMLInputElement`, chamado com o campo como `this`. */
const escrever = (campo: HTMLInputElement, valor: string) =>
  Reflect.set(HTMLInputElement.prototype, 'value', valor, campo)

const semAcento = (texto: string) =>
  texto.normalize('NFD').replace(/\p{M}/gu, '')

/** Tira o acento do campo e deixa o cursor onde estava. Diz se mudou algo. */
function tirarAcento(campo: HTMLInputElement) {
  const valor = campo.value
  const limpo = semAcento(valor)
  if (limpo === valor) return false
  const antes = valor.slice(0, campo.selectionStart ?? valor.length)
  const cursor = semAcento(antes).length
  escrever(campo, limpo)
  campo.setSelectionRange(cursor, cursor)
  return true
}

const campoDaBusca = (evento: Event) =>
  evento.target instanceof HTMLInputElement && evento.target.id === CAMPO
    ? evento.target
    : undefined

document.addEventListener(
  'input',
  (evento) => {
    const campo = campoDaBusca(evento)
    // No meio de uma composição (o acento de tecla morta, um IME), trocar o
    // valor desmancha o que está sendo composto. Espera o fim, abaixo.
    if (campo && !(evento as InputEvent).isComposing) tirarAcento(campo)
  },
  true,
)

// O Chrome não manda `input` depois do fim da composição, então este avisa o
// React do valor novo.
document.addEventListener(
  'compositionend',
  (evento) => {
    const campo = campoDaBusca(evento)
    if (campo && tirarAcento(campo))
      campo.dispatchEvent(new Event('input', { bubbles: true }))
  },
  true,
)
