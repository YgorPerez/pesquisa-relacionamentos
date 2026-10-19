// Copiado do Festival dos Macacos (`scripts/chave-ssh.ts`). O `VPS_SSH_KEY`
// é a chave privada inteira ou o caminho de uma. O `ssh -i` só lê arquivo: a
// chave inteira vai para um arquivo `600` numa pasta temporária, que sai
// quando o processo acaba.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** O caminho que o `ssh -i` recebe, ou `undefined` sem chave. */
export function arquivoDaChave(valor: string | undefined): string | undefined {
  if (!valor) return undefined
  if (!valor.includes('PRIVATE KEY-----')) return valor
  const pasta = mkdtempSync(join(tmpdir(), 'chave-ssh-'))
  const arquivo = join(pasta, 'chave')
  // Sem a quebra de linha do fim, o ssh diz que a chave tem formato inválido.
  writeFileSync(arquivo, valor.endsWith('\n') ? valor : `${valor}\n`, {
    mode: 0o600,
  })
  process.on('exit', () => rmSync(pasta, { recursive: true, force: true }))
  return arquivo
}
