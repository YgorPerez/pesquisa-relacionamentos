import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vite-plus/test'
import {
  arquivoOpcional,
  emailOpcional,
  lerVariaveis,
  ligada,
  pasta,
  porta,
} from './variaveis.ts'

const PASTA = mkdtempSync(join(tmpdir(), 'variaveis-'))
afterAll(() => rmSync(PASTA, { recursive: true, force: true }))
mkdirSync(join(PASTA, 'acervo'))
writeFileSync(join(PASTA, 'sitemap.xml'), '<urlset/>')

describe('lerVariaveis', () => {
  const esquemas = {
    DEV_PORTA: porta(4310),
    CONTEUDO_RAIZ: pasta(PASTA, '.'),
    SITEMAP_ANTERIOR: arquivoOpcional(PASTA),
    VITE_CONTAR_EM_LOCALHOST: ligada(false),
  }

  it('sem nenhuma variável, dá os padrões', () => {
    expect(lerVariaveis(esquemas, {})).toEqual({
      DEV_PORTA: 4310,
      CONTEUDO_RAIZ: PASTA,
      SITEMAP_ANTERIOR: undefined,
      VITE_CONTAR_EM_LOCALHOST: false,
    })
  })

  it('a chave em branco conta como ausente, e o espaço em volta sai', () => {
    const fonte = { DEV_PORTA: '', CONTEUDO_RAIZ: ' acervo ' }
    expect(lerVariaveis(esquemas, fonte)).toMatchObject({
      DEV_PORTA: 4310,
      CONTEUDO_RAIZ: join(PASTA, 'acervo'),
    })
    // O `createEnv` apaga as chaves em branco do objeto que recebe: a fonte
    // de quem chamou fica como estava.
    expect(fonte).toEqual({ DEV_PORTA: '', CONTEUDO_RAIZ: ' acervo ' })
  })

  it('lê o que o ambiente dá, com caminho relativo à base', () => {
    expect(
      lerVariaveis(esquemas, {
        DEV_PORTA: '5000',
        CONTEUDO_RAIZ: 'acervo',
        SITEMAP_ANTERIOR: 'sitemap.xml',
        VITE_CONTAR_EM_LOCALHOST: '1',
      }),
    ).toEqual({
      DEV_PORTA: 5000,
      CONTEUDO_RAIZ: join(PASTA, 'acervo'),
      SITEMAP_ANTERIOR: join(PASTA, 'sitemap.xml'),
      VITE_CONTAR_EM_LOCALHOST: true,
    })
  })

  it.each([
    ['DEV_PORTA', 'abc', 'uma porta, de 1 a 65535'],
    ['DEV_PORTA', '70000', 'uma porta, de 1 a 65535'],
    ['DEV_PORTA', '50.5', 'uma porta, de 1 a 65535'],
    ['CONTEUDO_RAIZ', 'nao-existe', 'uma pasta que existe'],
    ['CONTEUDO_RAIZ', 'sitemap.xml', 'uma pasta que existe'],
    ['SITEMAP_ANTERIOR', 'nao-existe.xml', 'um arquivo que existe'],
    ['SITEMAP_ANTERIOR', 'acervo', 'um arquivo que existe'],
    ['VITE_CONTAR_EM_LOCALHOST', 'talvez', '1 ou 0'],
  ])(
    '%s=%s para tudo, dizendo a variável e o esperado',
    (nome, valor, esperado) => {
      expect(() => lerVariaveis(esquemas, { [nome]: valor })).toThrow(
        `${nome}=${JSON.stringify(valor)}: esperado ${esperado}`,
      )
    },
  )

  it('um e-mail tem arroba e domínio', () => {
    const esquema = { GOATCOUNTER_EMAIL: emailOpcional }
    expect(lerVariaveis(esquema, {})).toEqual({ GOATCOUNTER_EMAIL: undefined })
    expect(lerVariaveis(esquema, { GOATCOUNTER_EMAIL: 'eu@site.com' })).toEqual(
      { GOATCOUNTER_EMAIL: 'eu@site.com' },
    )
    expect(() =>
      lerVariaveis(esquema, { GOATCOUNTER_EMAIL: 'eu@site' }),
    ).toThrow('GOATCOUNTER_EMAIL="eu@site": esperado um e-mail')
  })

  it('junta numa mensagem só todas as que vieram erradas', () => {
    expect(() =>
      lerVariaveis(esquemas, { DEV_PORTA: 'x', VITE_CONTAR_EM_LOCALHOST: 'y' }),
    ).toThrow(
      'Variáveis de ambiente inválidas:\n' +
        '  DEV_PORTA="x": esperado uma porta, de 1 a 65535\n' +
        '  VITE_CONTAR_EM_LOCALHOST="y": esperado 1 ou 0',
    )
  })
})
