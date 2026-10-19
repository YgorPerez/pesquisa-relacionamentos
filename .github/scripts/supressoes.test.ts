import { describe, expect, it } from 'vite-plus/test'
import { acharDiretiva, contarNoGrep, julgar, lerDiff } from './supressoes.ts'

// As diretivas vão montadas em pedaços: escritas inteiras, este arquivo seria
// lido como supressão pelo próprio auditor (e pelo Oxlint).
const OX = 'oxlint' + '-disable'
const TS = '@ts-' + 'expect-error'
const MEMO = "'use no " + "memo'"

describe('acharDiretiva', () => {
  it('acha a diretiva que abre um comentário e diz se tem motivo', () => {
    expect(
      acharDiretiva(`  // ${OX}-next-line no-console -- o log do CLI`),
    ).toEqual({
      nome: 'oxlint-disable',
      comMotivo: true,
    })
    expect(acharDiretiva(`/* ${OX} no-console */`)).toEqual({
      nome: 'oxlint-disable',
      comMotivo: false,
    })
    expect(acharDiretiva(`  // ${TS} o tipo do pacote está errado`)).toEqual({
      nome: '@ts-expect-error',
      comMotivo: true,
    })
    expect(acharDiretiva(`  // ${TS}`)).toEqual({
      nome: '@ts-expect-error',
      comMotivo: false,
    })
  })

  it('o `use no memo` pede o motivo num comentário na mesma linha', () => {
    expect(acharDiretiva(`  ${MEMO} // o compilador quebra o efeito`)).toEqual({
      nome: 'use no memo',
      comMotivo: true,
    })
    expect(acharDiretiva(`  ${MEMO}`)).toEqual({
      nome: 'use no memo',
      comMotivo: false,
    })
  })

  it('uma diretiva citada no meio de uma frase não desliga nada', () => {
    expect(acharDiretiva(`const texto = 'use ${OX} com motivo'`)).toBeNull()
    expect(acharDiretiva('// sem nada aqui')).toBeNull()
  })
})

const diff = (arquivo: string, ...linhas: string[]) =>
  [
    `diff --git a/${arquivo} b/${arquivo}`,
    `--- a/${arquivo}`,
    `+++ b/${arquivo}`,
    '@@ -1,0 +10,3 @@',
    ...linhas,
  ].join('\n')

describe('lerDiff', () => {
  it('separa as novas com e sem motivo, com a linha de cada uma', () => {
    const lido = lerDiff(
      diff(
        'frontend/src/ui/perfil.tsx',
        '+const a = 1',
        `+// ${OX}-next-line no-alert -- o aviso é a tela`,
        `+// ${TS}`,
      ),
    )
    expect(lido.comMotivo).toEqual([
      expect.objectContaining({
        arquivo: 'frontend/src/ui/perfil.tsx',
        linha: 11,
        nome: 'oxlint-disable',
      }),
    ])
    expect(lido.semMotivo).toEqual([
      expect.objectContaining({ linha: 12, nome: '@ts-expect-error' }),
    ])
  })

  it('não lê documentação, o vendorizado nem o próprio auditor', () => {
    const lido = lerDiff(
      [
        diff('docs/agents/integracao.md', `+// ${OX}`),
        diff('.agents/skills/x/a.ts', `+// ${OX}`),
        diff('.github/scripts/supressoes.test.ts', `+// ${OX}`),
      ].join('\n'),
    )
    expect(lido.semMotivo).toEqual([])
  })

  it('a configuração de um auditor que muda vai para uma pessoa', () => {
    const lido = lerDiff(
      [
        diff('frontend/doctor.config.ts', '+      files: ["x"],'),
        diff('frontend/package.json', '+    "react": "^19.4.0",'),
        diff(
          'packages/regras/package.json',
          '+    "fallow": "fallow health --min-score 50",',
        ),
      ].join('\n'),
    )
    expect([...lido.configuracao.keys()]).toEqual([
      'frontend/doctor.config.ts',
      'packages/regras/package.json',
    ])
  })
})

describe('contarNoGrep', () => {
  it('conta cada diretiva da árvore, pela saída do `git grep`', () => {
    const saida = [
      `abc:frontend/src/ui/a.tsx:3:// ${OX}-next-line x -- motivo`,
      `abc:frontend/src/ui/b.tsx:9:  // ${OX} y -- motivo`,
      `abc:frontend/src/ui/b.tsx:20:const t = "texto que cita ${OX}"`,
      `abc:packages/conteudo/src/c.ts:1:// ${TS} motivo`,
      `abc:frontend/src/routeTree.gen.ts:3:// @ts-${'nocheck'}`,
      `abc:docs/x.md:1:// ${OX}`,
    ].join('\n')
    expect(contarNoGrep(saida)).toEqual({
      'oxlint-disable': 2,
      '@ts-expect-error': 1,
    })
  })
})

describe('julgar', () => {
  const nada = {
    semMotivo: [],
    comMotivo: [],
    configuracao: new Map<string, string[]>(),
  }
  const achado = {
    arquivo: 'frontend/src/ui/a.tsx',
    linha: 3,
    nome: 'oxlint-disable',
    texto: '// …',
  }

  it('sem nada novo e no teto, passa', () => {
    const { passa } = julgar({
      ...nada,
      contagem: {},
      teto: {},
      rotulos: [],
      noCi: true,
    })
    expect(passa).toBe(true)
  })

  it('acima do teto falha, mesmo com o rótulo', () => {
    const { passa, linhas } = julgar({
      ...nada,
      comMotivo: [achado],
      contagem: { 'oxlint-disable': 1 },
      teto: { 'oxlint-disable': 0 },
      rotulos: ['supressao-revisada'],
      noCi: true,
    })
    expect(passa).toBe(false)
    expect(linhas.join('\n')).toContain('oxlint-disable: 1, e o teto é 0')
  })

  it('sem motivo falha sempre', () => {
    const { passa } = julgar({
      ...nada,
      semMotivo: [achado],
      contagem: { 'oxlint-disable': 1 },
      teto: { 'oxlint-disable': 1 },
      rotulos: ['supressao-revisada'],
      noCi: true,
    })
    expect(passa).toBe(false)
  })

  it('com motivo e no teto, o CI espera o rótulo; a máquina só avisa', () => {
    const entrada = {
      ...nada,
      comMotivo: [achado],
      contagem: { 'oxlint-disable': 1 },
      teto: { 'oxlint-disable': 1 },
    }
    expect(julgar({ ...entrada, rotulos: [], noCi: true }).passa).toBe(false)
    expect(
      julgar({ ...entrada, rotulos: ['supressao-revisada'], noCi: true }).passa,
    ).toBe(true)
    const local = julgar({ ...entrada, rotulos: [], noCi: false })
    expect(local.passa).toBe(true)
    expect(local.linhas.join('\n')).toContain('supressao-revisada')
  })

  it('abaixo do teto passa e pede para baixá-lo', () => {
    const { passa, linhas } = julgar({
      ...nada,
      contagem: {},
      teto: { '@ts-expect-error': 2 },
      rotulos: [],
      noCi: true,
    })
    expect(passa).toBe(true)
    expect(linhas.join('\n')).toContain('baixe')
  })
})
