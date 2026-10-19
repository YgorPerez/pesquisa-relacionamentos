// O HTML abaixo segue o que a API devolve em `body_html` para um PR com
// anexos (o formato que o Festival dos Macacos gravou no PR #979 dele), com o
// `?jwt=` dos endereços cortado.
import { describe, expect, it } from 'vite-plus/test'
import { avaliar, mudaTela } from './evidencia-de-tela.ts'

const anexo = (id: string, tipo: string) =>
  `https://private-user-images.githubusercontent.com/151045494/669128291-${id}.${tipo}`
const ID = (n: number) => `${n}2722361-1352-4244-896f-92760ae1b8cb`

const imagem = (n: number) =>
  `<td><a target="_blank" rel="noopener noreferrer" href="${anexo(ID(n), 'png')}"><img src="${anexo(ID(n), 'png')}" alt="antes" style="max-width: 100%;"></a></td>`
const video = (
  n: number,
) => `<td><details open="" class="details-reset border rounded-2">
  <summary class="tmp-px-3 py-2"><span class="m-1">antes.mp4</span></summary>
  <video src="${anexo(ID(n), 'mp4')}" controls="controls" muted="muted" class="d-block">
  </video>
</details>
</td>`
const caixa = (marcada: boolean) =>
  `<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" id="" disabled="" class="task-list-item-checkbox" aria-label="${marcada ? 'Completed' : 'Incomplete'} task"${marcada ? ' checked=""' : ''}> Nenhuma mudança de tela</li>
</ul>`

const descricao = (tela: string) => `<h2 dir="auto">Por quê</h2>
<p dir="auto">${imagem(8)}${video(9)}</p>
<h2 dir="auto">Tela</h2>
${tela}
<h2 dir="auto">Verificação</h2>
<p dir="auto">${video(7)}</p>`

const TELA = ['frontend/src/ui/perfil.tsx']

describe('mudaTela', () => {
  it('o que aparece na tela é tela', () => {
    for (const caminho of [
      'frontend/src/ui/perfil.tsx',
      'frontend/src/ui/perfil.css',
      'frontend/src/ui/selos.textos.ts',
      'frontend/src/routes/estudos/$slug.tsx',
      'frontend/src/conteudo/vista-guia.ts',
      'frontend/src/estado/perfil.ts',
      'frontend/src/styles.css',
      'frontend/public/og.png',
    ])
      expect({ caminho, tela: mudaTela(caminho) }).toEqual({
        caminho,
        tela: true,
      })
  })

  it('teste, story, servidor, contagem e o resto do repositório não são', () => {
    for (const caminho of [
      'frontend/src/ui/laco.test.ts',
      'frontend/src/ui/perfil.stories.tsx',
      'frontend/src/platform/storybook/com-router.tsx',
      'frontend/src/platform/registro-do-pedido.ts',
      'frontend/src/analytics/goatcounter.ts',
      'frontend/src/routeTree.gen.ts',
      'frontend/src/server.ts',
      'frontend/src/conteudo/virtual-acervo.d.ts',
      'frontend/e2e/perfil.e2e.ts',
      'frontend/scripts/capturar.ts',
      'packages/regras/src/grupo-possivel.ts',
      'estudos/algum-estudo.md',
    ])
      expect({ caminho, tela: mudaTela(caminho) }).toEqual({
        caminho,
        tela: false,
      })
  })
})

describe('avaliar', () => {
  it('sem arquivo de tela, passa sem olhar a descrição', () => {
    expect(avaliar('', ['scripts/portas.ts']).passa).toBe(true)
  })

  it('dois prints e dois vídeos diferentes na seção Tela passam', () => {
    const html = descricao(
      `<table><tr>${imagem(1)}${imagem(2)}</tr><tr>${video(3)}${video(4)}</tr></table>`,
    )
    expect(avaliar(html, TELA).passa).toBe(true)
  })

  it('só prints falha pelos vídeos', () => {
    const { passa, linhas } = avaliar(
      descricao(`<table><tr>${imagem(1)}${imagem(2)}</tr></table>`),
      TELA,
    )
    expect(passa).toBe(false)
    expect(linhas.some((l) => l.startsWith('Faltam vídeos'))).toBe(true)
    expect(linhas.some((l) => l.startsWith('Faltam prints'))).toBe(false)
  })

  it('o mesmo anexo duas vezes conta uma, e o de fora da seção não conta', () => {
    const { passa, linhas } = avaliar(
      descricao(`${imagem(1)}${imagem(1)}${video(3)}${video(3)}`),
      TELA,
    )
    expect(passa).toBe(false)
    expect(linhas).toContain('Em "## Tela": 1 imagem(ns), 1 vídeo(s).')
  })

  it('a caixa marcada passa sem anexo nenhum', () => {
    expect(avaliar(descricao(caixa(true)), TELA).passa).toBe(true)
  })

  it('a caixa desmarcada não dispensa nada', () => {
    const { passa, linhas } = avaliar(descricao(caixa(false)), TELA)
    expect(passa).toBe(false)
    expect(linhas.some((l) => l.startsWith('Faltam prints'))).toBe(true)
  })

  it('sem a seção Tela, falha e diz para pôr a seção', () => {
    const { passa, linhas } = avaliar(
      '<h2 dir="auto">Por quê</h2><p dir="auto">x</p>',
      TELA,
    )
    expect(passa).toBe(false)
    expect(linhas.some((l) => l.includes('não tem a seção "## Tela"'))).toBe(
      true,
    )
  })
})
