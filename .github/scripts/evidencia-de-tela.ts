// Um PR que muda tela mostra a tela na descrição: na seção `## Tela`, prints e
// vídeos de antes e de depois. O CI não compara tela nenhuma, e quem revisa só
// vê o que mudou se o PR mostrar (docs/agents/evidencia-de-tela.md). Veio do
// `evidencia-de-tela.ts` do Festival dos Macacos.
//
// Conta na descrição como o GitHub a mostra (o `body_html` da API), e não no
// markdown: o mesmo `github.com/user-attachments/assets/<uuid>` solto vira um
// player se o anexo é vídeo e um link se é imagem, e o `gh --attach` escreve
// o vídeo como `[nome.mp4](url)`, que também vira player. Só o HTML diz o que
// cada anexo é: uma imagem é um `<img>` de anexo, um vídeo é um `<video>`.
//
// Pede pelo menos duas imagens e dois vídeos diferentes, antes e depois. Um PR
// cuja tela não muda marca `- [x] Nenhuma mudança de tela` na seção e passa.
//
// Roda no `evidencia-de-tela.yml`, a cada PR e a cada edição da descrição, e
// na mão: `node .github/scripts/evidencia-de-tela.ts <número do PR>`.
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

/** O que aparece na tela de alguém: o app e o que ele serve de `public/`. */
const TELA = [/^frontend\/src\//, /^frontend\/public\//]

/** Do app, o que não desenha nada: teste, story, o andaime do Storybook, a
 * contagem do GoatCounter, o log e o redirecionamento do servidor, a árvore
 * de rotas gerada e os tipos. */
const FORA_DA_TELA = [
  /\.(?:test|stories)\.tsx?$/,
  /\.d\.ts$/,
  /\.md$/,
  /^frontend\/src\/platform\//,
  /^frontend\/src\/analytics\//,
  /^frontend\/src\/routeTree\.gen\.ts$/,
  /^frontend\/src\/server\.ts$/,
  /\.server\.tsx?$/,
]

export function mudaTela(caminho: string): boolean {
  return (
    TELA.some((r) => r.test(caminho)) &&
    !FORA_DA_TELA.some((r) => r.test(caminho))
  )
}

/** A seção Tela do HTML da descrição: do `<h2>Tela</h2>` até o próximo
 * `<h2`. */
function secaoTela(html: string): string | null {
  const inicio = html.search(/<h2\b[^>]*>\s*Tela\s*<\/h2>/i)
  if (inicio < 0) return null
  const resto = html.slice(inicio).replace(/^<h2\b[^>]*>[^<]*<\/h2>/i, '')
  const fim = resto.search(/<h2\b/i)
  return fim < 0 ? resto : resto.slice(0, fim)
}

/** O uuid de um anexo, que vem tanto em `github.com/user-attachments/assets/`
 * quanto no endereço assinado de `private-user-images.githubusercontent.com`. */
const ANEXO = String.raw`(?:user-attachments/assets/|private-user-images\.githubusercontent\.com/\d+/\d+-)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`

function contarEvidencia(secao: string) {
  const anexos = (tag: string) =>
    new Set(
      Array.from(
        secao.matchAll(
          new RegExp(String.raw`<${tag}\b[^>]*\bsrc="[^"]*?${ANEXO}`, 'g'),
        ),
        (achado) => achado[1],
      ),
    )
  return {
    imagens: anexos('img').size,
    videos: anexos('video').size,
    semMudanca:
      /<input\b[^>]*\bchecked\b[^>]*>\s*Nenhuma mudança de tela/i.test(secao),
  }
}

export type Veredito = { passa: boolean; linhas: string[] }

export function avaliar(html: string, arquivos: readonly string[]): Veredito {
  const daTela = arquivos.filter(mudaTela)
  if (daTela.length === 0)
    return {
      passa: true,
      linhas: ['Nenhum arquivo de tela mudou: não há o que mostrar.'],
    }
  const linhas = [
    'Arquivos que mudam tela:',
    ...daTela.map((a) => `- ${a}`),
    '',
  ]
  const secao = secaoTela(html)
  if (secao === null)
    return {
      passa: false,
      linhas: [
        ...linhas,
        'A descrição não tem a seção "## Tela" do modelo (.github/pull_request_template.md). Ponha a seção, com os prints e os vídeos de antes e depois.',
      ],
    }
  const { imagens, videos, semMudanca } = contarEvidencia(secao)
  if (semMudanca)
    return {
      passa: true,
      linhas: [
        ...linhas,
        '"Nenhuma mudança de tela" está marcado: o PR diz que a tela fica igual.',
      ],
    }
  linhas.push(`Em "## Tela": ${imagens} imagem(ns), ${videos} vídeo(s).`)
  const faltas: string[] = []
  if (imagens < 2)
    faltas.push(
      `Faltam prints: são pelo menos 2, antes e depois, e há ${imagens}. Tire com \`node frontend/scripts/capture.ts <rota>\` em cada lado.`,
    )
  if (videos < 2)
    faltas.push(
      `Faltam vídeos: são pelo menos 2, antes e depois, e há ${videos}. Grave com \`node frontend/scripts/capture.ts <rota> --video\` em cada lado.`,
    )
  if (faltas.length === 0) return { passa: true, linhas }
  return {
    passa: false,
    linhas: [
      ...linhas,
      ...faltas,
      'Anexe com `gh pr edit <n> --body-file corpo.md --attach ./antes.png --attach ./antes.mp4 ...`, ou marque "- [x] Nenhuma mudança de tela" se a tela fica igual. Como: docs/agents/evidencia-de-tela.md.',
    ],
  }
}

// A ponta que fala com a API do GitHub; o que ela decide é o `avaliar`.
if (import.meta.main) {
  const gh = (...argumentos: string[]) =>
    execFileSync('gh', argumentos, {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
  const pr = process.argv[2]
  if (!pr || !/^\d+$/.test(pr)) {
    console.error(
      'Uso: node .github/scripts/evidencia-de-tela.ts <número do PR>',
    )
    process.exit(2)
  }
  // O `{owner}/{repo}` o gh resolve pelo checkout, ou pelo GH_REPO no CI.
  const html = gh(
    'api',
    `repos/{owner}/{repo}/pulls/${pr}`,
    '-H',
    'Accept: application/vnd.github.html+json',
    '--jq',
    '.body_html // ""',
  )
  const arquivos = gh(
    'api',
    '--paginate',
    `repos/{owner}/{repo}/pulls/${pr}/files`,
    '--jq',
    '.[].filename',
  )
    .split('\n')
    .filter(Boolean)
  const { passa, linhas } = avaliar(html, arquivos)
  const relatorio = linhas.join('\n')
  if (passa) console.log(relatorio)
  else console.error(relatorio)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${relatorio}\n`)
  process.exit(passa ? 0 : 1)
}
