// Busca e links estáveis (#15, #29): título e descrição de cada página,
// sitemap, robots, os 301 do `antes` e a conferência contra o último
// sitemap publicado. Os casos partem da fixture válida e trocam um arquivo.
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  buscaDaDica,
  buscaDaFicha,
  buscaDoGuia,
  buscaDoTema,
  caminhosDoSitemap,
  dicaPorSlug,
  fichaPorSlug,
  formatarProblemas,
  guiaPorSlug,
  lerArquivos,
  montarAcervo,
  redirecionamentos,
  robotsTxt,
  sitemapXml,
  temaPorSlug,
  type Acervo,
  type Arquivo,
  type Resultado,
} from './index.ts'

const VALIDO = fileURLToPath(new URL('../fixtures/valido', import.meta.url))

function acervoDe(resultado: Resultado): Acervo {
  if (!resultado.ok) throw new Error(formatarProblemas(resultado.erros))
  return resultado.acervo
}

function errosDe(resultado: Resultado): string[] {
  if (resultado.ok) throw new Error('o acervo devia ter falhado')
  return resultado.erros.map((e) => e.mensagem)
}

const avisosDe = (resultado: Resultado) =>
  resultado.avisos.map((a) => a.mensagem)

type Troca = string | ((original: string) => string)

/** A fixture válida com arquivos trocados ou criados. */
function arquivosCom(trocas: Record<string, Troca> = {}): Arquivo[] {
  const arquivos = [...lerArquivos(VALIDO)]
  for (const [caminho, troca] of Object.entries(trocas)) {
    const i = arquivos.findIndex((a) => a.caminho === caminho)
    const original = i === -1 ? '' : (arquivos[i]?.texto ?? '')
    const novo = {
      caminho,
      texto: typeof troca === 'string' ? troca : troca(original),
    }
    if (i === -1) arquivos.push(novo)
    else arquivos[i] = novo
  }
  return arquivos
}

const com = (trocas: Record<string, Troca>) => montarAcervo(arquivosCom(trocas))

/** Acrescenta linhas ao fim do frontmatter. */
const noFrontmatter = (linhas: string) => (original: string) =>
  original.replace(/\n---\n/, `\n${linhas}\n---\n`)

const GUIA = 'guias/onde-conhecer/onde-os-casais-se-conhecem.md'
const OUTRO_GUIA = 'guias/onde-conhecer/app-ou-presencial.md'
const TEMA = 'guias/onde-conhecer/_tema.md'
const SILVA = 'estudos/silva-2020-apps-brasil.md'

describe('título e descrição de busca', () => {
  const acervo = acervoDe(montarAcervo(arquivosCom()))

  it('Guia: a Pergunta e a resposta curta, sem marcas nem referências', () => {
    expect(
      buscaDoGuia(guiaPorSlug(acervo, 'onde-os-casais-se-conhecem')!),
    ).toEqual({
      titulo: 'Onde os casais se conhecem hoje?',
      descricao:
        'No Brasil, 18% dos adultos jovens conheceram o parceiro por app. Nos EUA, a satisfação é parecida.',
    })
  })

  it('Guia: a resposta curta longa é cortada numa palavra, em até 155 caracteres', () => {
    const longa =
      'Uma frase comprida sobre onde os casais se conhecem, '.repeat(5)
    const guia = guiaPorSlug(
      acervoDe(
        com({
          [GUIA]: (t) =>
            t.replace(
              /\nNo Brasil[^\n]*\n/,
              `\n${longa}[@silva-2020-apps-brasil]\n`,
            ),
        }),
      ),
      'onde-os-casais-se-conhecem',
    )!
    const { descricao } = buscaDoGuia(guia)
    expect(descricao.length).toBeLessThanOrEqual(155)
    expect(descricao).toMatch(
      /^Uma frase comprida sobre onde os casais se conhecem, Uma frase .*\S…$/,
    )
    expect(longa.startsWith(descricao.slice(0, -1))).toBe(true)
  })

  it('Tema: o título e o parágrafo de contexto', () => {
    expect(buscaDoTema(temaPorSlug(acervo, 'onde-conhecer')!)).toEqual({
      titulo: 'Onde conhecer pessoas',
      descricao: 'Onde os casais se conhecem e se o lugar muda alguma coisa.',
    })
  })

  it('Ficha: "Autor ano: tema" e o primeiro achado', () => {
    expect(
      buscaDaFicha(fichaPorSlug(acervo, 'silva-2020-apps-brasil')!),
    ).toEqual({
      titulo: 'Silva e Souza 2020: apps de namoro no Brasil',
      descricao: 'Conheceram o parceiro por app: 18%.',
    })
  })

  it('Dica: o texto nos dois', () => {
    expect(buscaDaDica(dicaPorSlug(acervo, 'apps-como-complemento')!)).toEqual({
      titulo: 'Use o app como complemento, não como o único caminho.',
      descricao: 'Use o app como complemento, não como o único caminho.',
    })
  })

  it('o `seo` sobrescreve título e descrição', () => {
    const seo =
      'seo:\n  titulo: Onde os casais se conhecem\n  descricao: Uma descrição escrita à mão.'
    const trocado = acervoDe(
      com({
        [GUIA]: noFrontmatter(seo),
        [SILVA]: noFrontmatter(seo),
        [TEMA]: noFrontmatter(seo),
      }),
    )
    const esperado = {
      titulo: 'Onde os casais se conhecem',
      descricao: 'Uma descrição escrita à mão.',
    }
    expect(
      buscaDoGuia(guiaPorSlug(trocado, 'onde-os-casais-se-conhecem')!),
    ).toEqual(esperado)
    expect(
      buscaDaFicha(fichaPorSlug(trocado, 'silva-2020-apps-brasil')!),
    ).toEqual(esperado)
    expect(buscaDoTema(temaPorSlug(trocado, 'onde-conhecer')!)).toEqual(
      esperado,
    )
  })

  it('a fixture válida não dá aviso', () => {
    expect(avisosDe(montarAcervo(arquivosCom()))).toEqual([])
  })

  it('avisa quando o título passa de 60 caracteres, sugerindo o `seo`', () => {
    const pergunta =
      'Onde os casais brasileiros de todas as idades se conhecem hoje em dia?'
    const resultado = com({
      [GUIA]: (t) => t.replace(/^pergunta: .*$/m, `pergunta: ${pergunta}`),
    })
    expect(resultado.ok).toBe(true)
    expect(avisosDe(resultado)).toEqual([
      `${GUIA}: pergunta: o título de busca tem ${pergunta.length} caracteres e o limite é 60; escreva um mais curto em seo.titulo`,
    ])
  })

  it('avisa quando a descrição do `seo` passa de 155 caracteres', () => {
    const longa = 'a'.repeat(160)
    const resultado = com({
      [SILVA]: noFrontmatter(`seo:\n  descricao: ${longa}`),
    })
    expect(avisosDe(resultado)).toEqual([
      `${SILVA}: seo.descricao: a descrição de busca tem 160 caracteres e o limite é 155`,
    ])
  })
})

describe('sitemap e robots', () => {
  const acervo = acervoDe(montarAcervo(arquivosCom()))

  it('lista início, Temas, Guias, Dicas publicadas, as listas, as calculadoras e as Fichas ✅/🟡', () => {
    expect(caminhosDoSitemap(acervo)).toEqual([
      '/',
      '/onde-conhecer',
      '/onde-conhecer/onde-os-casais-se-conhecem',
      '/onde-conhecer/app-ou-presencial',
      '/dicas',
      '/dicas/apps-como-complemento',
      '/estudos',
      '/estudos/costa-2018-satisfacao',
      '/estudos/silva-2020-apps-brasil',
      '/grupo-possivel',
      '/prioridades',
    ])
  })

  it('o XML leva cada caminho com o domínio, e a Ficha ⬜ fica de fora', () => {
    const xml = sitemapXml(acervo)
    expect(xml).toMatch(
      /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/,
    )
    expect(xml).toContain('<url><loc>https://temestudo.cloud/</loc></url>')
    expect(xml).toContain(
      '<url><loc>https://temestudo.cloud/estudos/silva-2020-apps-brasil</loc></url>',
    )
    expect(xml).not.toContain('lima-2015-encontros')
    expect(xml).not.toContain('encontros-presenciais')
  })

  it('o robots libera tudo e aponta o sitemap', () => {
    expect(robotsTxt()).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://temestudo.cloud/sitemap.xml\n',
    )
  })
})

describe('antes: 301 do caminho antigo', () => {
  it('Ficha, Dica e Guia apontam o slug antigo para o caminho de hoje', () => {
    const acervo = acervoDe(
      com({
        [SILVA]: noFrontmatter('antes: [silva-2020-apps]'),
        'dicas/apps-como-complemento.md': noFrontmatter(
          'antes: [app-complemento]',
        ),
        [GUIA]: noFrontmatter(
          'antes: [onde-casais-se-conhecem, escolher-parceiro/onde-se-conhecem]',
        ),
      }),
    )
    expect(redirecionamentos(acervo)).toEqual({
      '/estudos/silva-2020-apps': '/estudos/silva-2020-apps-brasil',
      '/dicas/app-complemento': '/dicas/apps-como-complemento',
      '/onde-conhecer/onde-casais-se-conhecem':
        '/onde-conhecer/onde-os-casais-se-conhecem',
      '/escolher-parceiro/onde-se-conhecem':
        '/onde-conhecer/onde-os-casais-se-conhecem',
    })
  })

  it('o Tema renomeado leva junto os Guias dele, com os slugs antigos', () => {
    const acervo = acervoDe(
      com({
        [TEMA]: noFrontmatter('antes: [conhecer-gente]'),
        [OUTRO_GUIA]: noFrontmatter('antes: [app-ou-bar]'),
      }),
    )
    expect(redirecionamentos(acervo)).toEqual({
      '/conhecer-gente': '/onde-conhecer',
      '/conhecer-gente/onde-os-casais-se-conhecem':
        '/onde-conhecer/onde-os-casais-se-conhecem',
      '/conhecer-gente/app-ou-presencial': '/onde-conhecer/app-ou-presencial',
      '/onde-conhecer/app-ou-bar': '/onde-conhecer/app-ou-presencial',
      '/conhecer-gente/app-ou-bar': '/onde-conhecer/app-ou-presencial',
    })
  })

  it('sem `antes`, nenhum redirecionamento', () => {
    expect(redirecionamentos(acervoDe(montarAcervo(arquivosCom())))).toEqual({})
  })

  it('falha quando o `antes` aponta um caminho que ainda existe', () => {
    expect(
      errosDe(
        com({
          [OUTRO_GUIA]: noFrontmatter('antes: [onde-os-casais-se-conhecem]'),
        }),
      ),
    ).toContain(
      `${OUTRO_GUIA}: antes: o caminho /onde-conhecer/onde-os-casais-se-conhecem ainda é uma página do site; o "antes" lista só caminhos que sumiram`,
    )
  })

  it('falha quando dois arquivos declaram o mesmo caminho antigo', () => {
    expect(
      errosDe(
        com({
          [GUIA]: noFrontmatter('antes: [velho]'),
          [OUTRO_GUIA]: noFrontmatter('antes: [velho]'),
        }),
      ),
    ).toContain(
      `${OUTRO_GUIA}: antes: o caminho /onde-conhecer/velho já está no "antes" de ${GUIA}`,
    )
  })

  it('falha quando o `antes` do Tema é uma rota do site', () => {
    expect(
      errosDe(com({ [TEMA]: noFrontmatter('antes: [estudos]') })),
    ).toContain(
      `${TEMA}: antes: o caminho /estudos ainda é uma página do site; o "antes" lista só caminhos que sumiram`,
    )
  })
})

describe('o último sitemap publicado', () => {
  const sitemap = (...caminhos: string[]) =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${caminhos
      .map((c) => `  <url><loc>https://temestudo.cloud${c}</loc></url>`)
      .join('\n')}\n</urlset>\n`

  it('passa quando todo caminho dele ainda é página do site, mesmo a Ficha que virou ⬜', () => {
    const anterior = sitemap(
      '/',
      '/onde-conhecer/app-ou-presencial',
      '/estudos/lima-2015-encontros',
      '/prioridades',
    )
    expect(montarAcervo(arquivosCom(), { sitemapAnterior: anterior }).ok).toBe(
      true,
    )
  })

  it('falha quando um caminho sumiu sem estar no `antes` de algum arquivo', () => {
    const anterior = sitemap(
      '/',
      '/onde-conhecer/app-ou-bar',
      '/estudos/silva-2020',
    )
    expect(
      errosDe(montarAcervo(arquivosCom(), { sitemapAnterior: anterior })),
    ).toEqual([
      'sitemap.xml publicado: /onde-conhecer/app-ou-bar sumiu do site; declare o caminho antigo no "antes" do arquivo que o substituiu',
      'sitemap.xml publicado: /estudos/silva-2020 sumiu do site; declare o caminho antigo no "antes" do arquivo que o substituiu',
    ])
  })

  it('passa quando o caminho que sumiu está no `antes`', () => {
    const anterior = sitemap('/onde-conhecer/app-ou-bar', '/estudos/silva-2020')
    const resultado = montarAcervo(
      arquivosCom({
        [OUTRO_GUIA]: noFrontmatter('antes: [app-ou-bar]'),
        [SILVA]: noFrontmatter('antes: [silva-2020]'),
      }),
      { sitemapAnterior: anterior },
    )
    expect(resultado.ok).toBe(true)
  })

  it('falha quando o sitemap publicado não tem nenhum <loc>', () => {
    expect(
      errosDe(
        montarAcervo(arquivosCom(), { sitemapAnterior: '<html>erro</html>' }),
      ),
    ).toEqual([
      'sitemap.xml publicado: não achei nenhum <loc>; confira o arquivo baixado',
    ])
  })
})
