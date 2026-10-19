// O gancho `PreToolUse` do Bash no Claude Code (`.claude/settings.json`): o
// comando que muda um arquivo do repositório por um script de Python ou por
// `sed -i` recebe um aviso para usar a ferramenta Edit. Veio do Festival dos
// Macacos, onde uns 20 desses patches pararam no meio ou erraram a âncora. O
// comando roda mesmo assim; o aviso entra no contexto do agente. Escrever em
// `/tmp` não avisa.
//
// O `sed` e o `python` só contam em posição de comando, fora de aspas e de
// heredoc: uma mensagem de commit ou um `echo` que cita `sed -i` não é patch
// (Escala-as-Dores/festival-macacos#1432).
//
//   echo '{"tool_input":{"command":"..."}}' | node scripts/aviso-de-patch.ts

import { readFileSync } from 'node:fs'

const FORA_DO_REPO = /^(\/tmp\/|\$\(mktemp|\$TMPDIR|\/dev\/)/

/** Onde começa um comando: início, `;`, `&&`, `||`, `|`, `(`, `$(`, nova
 * linha, seguidos de atribuições de ambiente e de `sudo`. */
const INICIO_DE_COMANDO = String.raw`(?:^|[;&|(\n]|\$\()\s*(?:[A-Za-z_]\w*=\S*\s+)*(?:sudo\s+)?`

/** O comando sem o corpo dos heredocs e com cada trecho entre aspas trocado
 * por `''`: sobra só o que o shell lê como comando e argumento. */
function semTextoCitado(comando: string): string {
  const linhas = comando.split('\n')
  const fora: string[] = []
  let fim: string | null = null
  for (const linha of linhas) {
    if (fim !== null) {
      if (linha.trim() === fim) fim = null
      continue
    }
    fora.push(linha)
    const heredoc = linha.match(/<<-?\s*['"]?(\w+)['"]?/)
    if (heredoc) fim = heredoc[1] ?? null
  }
  return fora.join('\n').replace(/'[^']*'|"(?:[^"\\]|\\.)*"/g, "''")
}

/** Valores de atribuições simples (`p='x.md'`, `p = Path("x.md")`), para
 * saber aonde vai um `open(p, 'w')`. */
function variaveis(comando: string): Map<string, string> {
  const valores = new Map<string, string>()
  for (const achado of comando.matchAll(
    /\b([A-Za-z_]\w*)\s*=\s*(?:Path\(\s*)?['"]([^'"\n]+)['"]/g,
  ))
    valores.set(achado[1] ?? '', achado[2] ?? '')
  return valores
}

/** O caminho de um argumento de Python: o literal sem aspas, o valor da
 * variável, ou o nome dela quando não se sabe o valor. */
function caminhoPython(
  argumento: string,
  valores: Map<string, string>,
): string {
  const literal = argumento.match(/^(?:Path\(\s*)?['"]([^'"]+)['"]\)?$/)
  if (literal) return literal[1] ?? ''
  return valores.get(argumento) ?? argumento
}

/** Os arquivos de um `sed -i`: os argumentos que não são opção, tirando o
 * script quando ele não veio por `-e` ou `-f`. */
function arquivosDoSed(argumentos: string): string[] {
  const partes = argumentos.trim().split(/\s+/)
  if (!partes.some((parte) => /^(-[a-zA-Z]*i|--in-place)/.test(parte)))
    return []
  let scriptPorOpcao = false
  const soltas: string[] = []
  for (let i = 0; i < partes.length; i++) {
    const parte = partes[i] ?? ''
    if (/^-[a-zA-Z]*[ef]$/.test(parte)) {
      scriptPorOpcao = true
      i++
    } else if (!parte.startsWith('-')) soltas.push(parte)
  }
  const arquivos = scriptPorOpcao ? soltas : soltas.slice(1)
  return arquivos.filter(
    (arquivo) =>
      arquivo !== "''" &&
      /[A-Za-z]/.test(arquivo) &&
      /^[\w./~$-]+$/.test(arquivo),
  )
}

/** Os arquivos que o comando escreve por Python ou `sed -i`: o caminho quando
 * dá para saber, o nome da variável quando não dá. Vazia quando não escreve
 * nada no repositório. */
export function escritasPorScript(comando: string): string[] {
  const comandos = semTextoCitado(comando)
  const escritas: string[] = []
  if (new RegExp(`${INICIO_DE_COMANDO}python3?\\b`).test(comandos)) {
    const valores = variaveis(comando)
    for (const achado of comando.matchAll(
      /\bopen\(\s*([^,)]+?)\s*,\s*['"][wa]\+?['"]/g,
    ))
      escritas.push(caminhoPython(achado[1] ?? '', valores))
    for (const achado of comando.matchAll(
      /((?:Path\(\s*)?[\w.'"/]+\)?)\.write_text\(/g,
    ))
      escritas.push(caminhoPython(achado[1] ?? '', valores))
  }
  for (const achado of comandos.matchAll(
    new RegExp(`${INICIO_DE_COMANDO}sed\\s+([^;&|\\n)]*)`, 'g'),
  ))
    escritas.push(...arquivosDoSed(achado[1] ?? ''))
  return escritas.filter((caminho) => !FORA_DO_REPO.test(caminho))
}

/** O aviso, ou `null` quando o comando não escreve por script. */
export function aviso(comando: string): string | null {
  const escritas = escritasPorScript(comando)
  if (escritas.length === 0) return null
  return (
    `Este comando muda arquivo por script (${escritas.join(', ')}). No repositório, mude arquivo com a ferramenta Edit, ` +
    'um trecho por chamada: o patch por Python ou `sed -i` erra a âncora sem avisar, e um que para no meio ' +
    'deixa a mudança pela metade.'
  )
}

if (import.meta.main) {
  const entrada = JSON.parse(readFileSync(0, 'utf8') || '{}') as {
    tool_input?: { command?: string }
  }
  const texto = aviso(entrada.tool_input?.command ?? '')
  if (texto)
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: texto,
        },
      }),
    )
}
