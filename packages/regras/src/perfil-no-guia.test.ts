import { describe, expect, it } from 'vite-plus/test'
import { perfilNoGuia } from './perfil-no-guia.ts'
import type { Cobre } from './vale-para-voce.ts'

const HETERO: Cobre = { casal: 'hetero' }
const JOVENS: Cobre = { generos: ['homem', 'mulher'], procura: ['homens', 'mulheres'], idades: { min: 18, max: 35 } }

// O Guia da fixture do e2e: o número-chave vem da Ficha dos jovens; o segundo
// achado, de casais héteros; a Dica cita as duas.
const GUIA = {
  chave: [JOVENS],
  achados: [[JOVENS], [HETERO]],
  dicas: [[JOVENS, HETERO]],
}

describe('perfilNoGuia', () => {
  it('sem Perfil não marca nada', () => {
    expect(perfilNoGuia(null, GUIA)).toBeNull()
  })

  it('conta os achados com dado e diz que o número-chave vale', () => {
    const r = perfilNoGuia({ genero: 'homem', procura: 'homens', idade: 30 }, GUIA)
    expect(r?.achados).toEqual([{ cobre: true }, { cobre: false }])
    expect(r?.dicas).toEqual([{ cobre: true }])
    expect(r?.comDado).toBe(1)
    expect(r?.chave).toEqual({ vale: true })
  })

  it('quando o número-chave não vale, aponta o primeiro achado que vale', () => {
    const r = perfilNoGuia({ genero: 'mulher', procura: 'homens', idade: 50 }, GUIA)
    expect(r?.achados).toEqual([{ cobre: false }, { cobre: true }])
    expect(r?.chave).toEqual({ vale: false, achado: 1 })
  })

  it('quando nada cobre, a chave não aponta achado e comDado é zero', () => {
    const r = perfilNoGuia({ genero: 'outro', procura: 'homens', idade: 30 }, GUIA)
    expect(r?.comDado).toBe(0)
    expect(r?.chave).toEqual({ vale: false, achado: null })
  })

  it('sem número-chave marcado, a linha fala só dos achados', () => {
    const r = perfilNoGuia({ genero: 'homem', procura: 'mulheres', idade: 30 }, { ...GUIA, chave: null })
    expect(r?.chave).toBeNull()
  })
})
