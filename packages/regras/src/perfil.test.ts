import { describe, expect, it } from 'vite-plus/test'
import { descreverPerfil, lerPerfil } from './perfil.ts'

describe('lerPerfil', () => {
  it('aceita o Perfil completo', () => {
    expect(lerPerfil({ genero: 'mulher', procura: 'ambos', idade: 24 })).toEqual({
      genero: 'mulher',
      procura: 'ambos',
      idade: 24,
    })
  })

  it('aceita a idade escrita no campo do formulário', () => {
    expect(lerPerfil({ idade: '31' })).toEqual({ idade: 31 })
  })

  it('descarta o que está fora das listas e a idade abaixo de 18 ou quebrada', () => {
    expect(lerPerfil({ genero: 'gato', procura: 'homens', idade: 17 })).toEqual({ procura: 'homens' })
    expect(lerPerfil({ genero: 'homem', idade: 30.5 })).toEqual({ genero: 'homem' })
    expect(lerPerfil({ genero: 'homem', idade: '' })).toEqual({ genero: 'homem' })
  })

  it('devolve null quando nada sobra', () => {
    expect(lerPerfil({})).toBeNull()
    expect(lerPerfil({ genero: 'x', idade: 9 })).toBeNull()
    expect(lerPerfil('homem')).toBeNull()
    expect(lerPerfil(null)).toBeNull()
  })
})

describe('descreverPerfil', () => {
  it('escreve o Perfil numa linha', () => {
    expect(descreverPerfil({ genero: 'homem', procura: 'homens', idade: 30 })).toBe('homem, procura homens, 30 anos')
    expect(descreverPerfil({ genero: 'outro', procura: 'ambos' })).toBe('outro gênero, procura homens e mulheres')
    expect(descreverPerfil({ idade: 45 })).toBe('45 anos')
  })
})
