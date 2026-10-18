// O gancho `PreToolUse` do Bash no Claude Code (`.claude/settings.json`): o
// comando que muda um arquivo do repositório por um script de Python ou por
// `sed -i` recebe um aviso para usar a ferramenta Edit. Veio do Festival dos
// Macacos, onde uns 20 desses patches pararam no meio ou erraram a âncora. O
// comando roda mesmo assim; o aviso entra no contexto do agente. Escrever em
// `/tmp` não avisa.
//
//   echo '{"tool_input":{"command":"..."}}' | node scripts/aviso-de-patch.ts

import { readFileSync } from 'node:fs'

const FORA_DO_REPO = /^['"]?(\/tmp\/|\$\(mktemp|\/dev\/)/

/** Os arquivos que o comando escreve por Python ou `sed -i`, como estão no
 * texto: `p` quando o caminho é uma variável. Vazia quando não escreve nada
 * no repositório. */
export function escritasPorScript(comando: string): string[] {
  const escritas: string[] = []
  if (/\bpython3?\b/.test(comando)) {
    for (const achado of comando.matchAll(
      /\bopen\(\s*([^,)]+?)\s*,\s*['"][wa]\+?['"]/g,
    ))
      escritas.push(achado[1] ?? '')
    for (const achado of comando.matchAll(/([\w.'"/]+)\.write_text\(/g))
      escritas.push(achado[1] ?? '')
  }
  for (const achado of comando.matchAll(
    /\bsed\s+(?:-\w*\s+)*-i\S*\s+(?:(?:-e\s+)?(?:'[^']*'|"[^"]*"|\S+)\s+)+?((?:[^\s;&|]+\.\w+))/g,
  ))
    escritas.push(achado[1] ?? '')
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
