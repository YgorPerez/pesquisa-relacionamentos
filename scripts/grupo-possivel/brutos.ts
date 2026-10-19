// Os arquivos brutos do IBGE: baixa uma vez para um cache fora do
// repositório e lê de dentro dos zips sem descompactar no disco.
import { spawn } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, renameSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream as WebReadableStream } from 'node:stream/web'

/** `BRUTOS_DIR` troca o lugar; o padrão fica fora do repositório. */
export const PASTA_BRUTOS =
  process.env.BRUTOS_DIR ?? join(homedir(), '.cache', 'tem-estudo', 'brutos')

export const FTP = 'https://ftp.ibge.gov.br'

/** Baixa `url` para `destino` se ainda não estiver lá. */
export async function baixar(url: string, destino: string): Promise<string> {
  if (existsSync(destino)) return destino
  mkdirSync(dirname(destino), { recursive: true })
  console.log(`baixando ${url}`)
  const resposta = await fetch(url)
  if (!resposta.ok || !resposta.body)
    throw new Error(`${url} respondeu ${resposta.status}`)
  const parcial = `${destino}.parcial`
  await pipeline(
    Readable.fromWeb(resposta.body as WebReadableStream),
    createWriteStream(parcial),
  )
  renameSync(parcial, destino)
  return destino
}

/** Lista os nomes dos arquivos dentro de um zip (`unzip -Z1`). */
export async function arquivosDoZip(zip: string): Promise<string[]> {
  const nomes: string[] = []
  for await (const linha of linhasDoComando('unzip', ['-Z1', zip]))
    nomes.push(linha)
  return nomes
}

/** As linhas de um arquivo de dentro do zip, em latin1 (a codificação do IBGE). */
export function linhasDoZip(
  zip: string,
  arquivo: string,
): AsyncIterable<string> {
  return linhasDoComando('unzip', ['-p', zip, arquivo], 'latin1')
}

async function* linhasDoComando(
  comando: string,
  args: string[],
  codificacao: BufferEncoding = 'utf8',
): AsyncGenerator<string> {
  const filho = spawn(comando, args, { stdio: ['ignore', 'pipe', 'inherit'] })
  filho.stdout.setEncoding(codificacao)
  const fim = new Promise<number>((resolver) =>
    filho.on('close', (codigo) => resolver(codigo ?? 1)),
  )
  for await (const linha of createInterface({
    input: filho.stdout,
    crlfDelay: Infinity,
  }))
    yield linha
  const codigo = await fim
  if (codigo !== 0)
    throw new Error(`${comando} ${args.join(' ')} saiu com ${codigo}`)
}
