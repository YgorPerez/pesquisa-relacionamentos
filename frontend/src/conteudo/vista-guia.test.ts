import { describe, expect, it } from 'vite-plus/test'
import { fichasDoNumeroChave } from './vista-guia'

describe('fichasDoNumeroChave', () => {
  it('pega as Fichas citadas na frase do número-chave', () => {
    expect(
      fichasDoNumeroChave(
        'No Brasil, ==18% dos adultos jovens== conheceram o parceiro por app [@silva-2020]. O resto diverge [@costa-2018].',
      ),
    ).toEqual(['silva-2020'])
  })

  it('pega todas as Fichas da frase, mesmo antes do número', () => {
    expect(
      fichasDoNumeroChave(
        'Dois estudos [@a] acham ==39%== [@b][@c]! Outro [@d].',
      ),
    ).toEqual(['a', 'b', 'c'])
  })

  it('sem número-chave, ou sem Ficha na frase dele, devolve null', () => {
    expect(
      fichasDoNumeroChave('Depende de quem você procura [@costa-2018].'),
    ).toBeNull()
    expect(
      fichasDoNumeroChave(
        'Foram ==18%== no total. Fonte depois [@silva-2020].',
      ),
    ).toBeNull()
  })
})
