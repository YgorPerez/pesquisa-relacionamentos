// A prévia do link do Grupo possível sobre os dados de fixture: o "Brasil"
// da fixture é só o Acre (`e2e/acervo/dados`).
import { resolve } from 'node:path'
import { abrirPacote } from '@tem-estudo/rules/possible-group-data'
import { queryDoLink } from '@tem-estudo/rules/link'
import { REQUISITOS_PADRAO } from '@tem-estudo/rules/requirements'
import { describe, expect, it } from 'vite-plus/test'
import { montarPacotes } from '../../vite/grupo-possivel.ts'
import { montarPreviaDoGrupo } from './previa-do-grupo'

const montados = montarPacotes(
  resolve(import.meta.dirname, '../../e2e/acervo/dados/grupo-possivel'),
)
const dados = {
  lugares: [...montados.pacotes.keys()],
  exemplo: montados.exemplo,
}
const pacote = async (lugar: string) => {
  const texto = montados.pacotes.get(lugar as never)
  return texto ? abrirPacote(JSON.parse(texto)) : null
}
const PERFIL = { genero: 'mulher', procura: 'homens', idade: 28 } as const

const previa = (query: string, deOnde = pacote) =>
  montarPreviaDoGrupo(query, dados, deOnde)

describe('montarPreviaDoGrupo', () => {
  it('sem a query de link, não há prévia', async () => {
    expect(await previa('')).toBeNull()
    expect(await previa('utm_source=zap')).toBeNull()
  })

  it('o link sem nada dito leva a conta de exemplo, sem baixar pacote', async () => {
    const nenhum = async () => {
      throw new Error('não devia pedir pacote')
    }
    const semNada = queryDoLink({
      calculadora: 'grupo-possivel',
      perfil: null,
      requisitos: null,
    })
    expect((await previa(semNada, nenhum))?.titulo).toMatch(/^Entre .+ e /)
  })

  it('o município entra no título', async () => {
    const query = queryDoLink({
      calculadora: 'grupo-possivel',
      perfil: PERFIL,
      requisitos: {
        ...REQUISITOS_PADRAO,
        lugar: { uf: 'AC', municipio: '1200401' },
      },
    })
    expect((await previa(query))?.titulo).toContain('Rio Branco (AC)')
  })

  it('um município que os dados não têm vale a UF inteira', async () => {
    const query = queryDoLink({
      calculadora: 'grupo-possivel',
      perfil: PERFIL,
      requisitos: {
        ...REQUISITOS_PADRAO,
        lugar: { uf: 'AC', municipio: '9999999' },
      },
    })
    expect((await previa(query))?.titulo).toMatch(/ em AC, /)
  })

  it('sem o pacote do Brasil, não há prévia', async () => {
    const query = queryDoLink({
      calculadora: 'grupo-possivel',
      perfil: PERFIL,
      requisitos: null,
    })
    expect(await previa(query, async () => null)).toBeNull()
  })
})
