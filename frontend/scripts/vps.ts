// O app na VPS, com troca blue/green no molde do Festival dos Macacos
// (`frontend/scripts/vps.ts` de lá). O `deploy.yml` o chama assim:
//
//   VPS_HOST=… [VPS_USER=root] [VPS_PORT=22] [VPS_SSH_KEY=<a chave, ou o caminho dela>] \
//     node scripts/vps.ts --publicar .output <sha>
//   … node scripts/vps.ts --voltar [<sha>]
//
// `--publicar` manda o `.output`, o `Dockerfile`, o vhost e a rotação dos
// logs (`../nginx/`), monta a imagem `temestudo-app:sha-<sha>` na VPS e troca
// o contêiner. `--voltar` troca para uma imagem que a VPS já tem: a do deploy
// anterior, sem o SHA, ou a do SHA pedido.
//
// O que cada etapa faz na VPS é o plano (`plano-do-deploy.ts`, ADR 0007).
// Aqui fica só quem o segue: pelo SSH, ou, no `vps.test.ts`, num bash com um
// docker de mentira. O log diz quanto cada etapa levou (`cronometro.ts`,
// ADR 0009).
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  emailOpcional,
  lerVariaveis,
  porta as umaPorta,
  usuario as umUsuario,
} from '../../scripts/variaveis.ts'
import { arquivoDaChave } from './chave-ssh.ts'
import { cronometro } from './cronometro.ts'
import {
  CONFIGURACAO_DO_HOST,
  type Etapa,
  planoDoPublicar,
  planoDoVoltar,
  prologo,
} from './plano-do-deploy.ts'

// O `nginx.test.ts` confere o vhost contra estes.
export { CONFIGURACAO_DO_HOST, STATS } from './plano-do-deploy.ts'

/** A VPS como o deploy a vê: roda um script na pasta do app e recebe
 * arquivos em `envio/`. */
export type Vps = {
  rodar: (script: string) => string
  enviar: (pasta: string, nomes: readonly string[]) => void
}

type Destino = {
  host: string
  porta: string
  usuario: string
  chave?: string
}

function opcoes({ porta, chave }: Destino, portaComo: '-p' | '-P') {
  return [
    portaComo,
    porta,
    '-o',
    'BatchMode=yes',
    '-o',
    'StrictHostKeyChecking=accept-new',
    ...(chave ? ['-i', chave, '-o', 'IdentitiesOnly=yes'] : []),
  ]
}

function rodar(
  comando: string,
  args: string[],
  cwd?: string,
  entrada?: string,
) {
  const r = spawnSync(comando, args, {
    cwd,
    input: entrada,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  })
  if (r.status !== 0)
    throw new Error(`${comando} falhou (saiu com ${r.status}).`)
  return r.stdout
}

/** A VPS de verdade: o script vai pelo stdin do `ssh`, os arquivos pelo
 * `scp`. */
function pelaSsh(destino: Destino): Vps {
  const conta = `${destino.usuario}@${destino.host}`
  return {
    rodar: (script) =>
      rodar(
        'ssh',
        [...opcoes(destino, '-p'), conta, 'bash -s'],
        undefined,
        `${prologo()}${script}`,
      ),
    enviar: (pasta, nomes) =>
      void rodar(
        'scp',
        [...opcoes(destino, '-P'), ...nomes, `${conta}:/opt/temestudo/envio/`],
        pasta,
      ),
  }
}

/** Segue o plano na VPS, etapa por etapa, com o tempo de cada uma no log. */
function seguirOPlano({
  etapas,
  vps,
  envio,
  dizer,
  agora,
}: {
  etapas: Etapa[]
  vps: Vps
  /** A pasta local de onde sai o `envio` das etapas. */
  envio?: string
  dizer: (linha: string) => void
  agora?: () => number
}) {
  const relogio = cronometro(dizer, agora)
  const rodarEDizer = (script: string) => {
    const saida = vps.rodar(script).trim()
    if (saida) dizer(saida)
  }
  for (const etapa of etapas)
    relogio.etapa(etapa.nome, () => {
      if (!etapa.seFalhar) {
        rodarEDizer(etapa.script)
      } else {
        // Uma falha aqui vira aviso, e o deploy segue.
        try {
          rodarEDizer(etapa.script)
        } catch (erro) {
          dizer(
            `Aviso: ${etapa.seFalhar.aviso} (${(erro as Error).message}). O site segue.`,
          )
          try {
            rodarEDizer(etapa.seFalhar.script)
          } catch {
            dizer(`Aviso: ${etapa.seFalhar.avisoSeFalharDeNovo}`)
          }
        }
      }
      if (etapa.envio) {
        if (!envio) throw new Error(`A etapa ${etapa.nome} pede um envio.`)
        dizer('O build vai para a VPS.')
        vps.enviar(envio, etapa.envio)
      }
    })
  relogio.total()
}

/** Publica o `.output` do build com o SHA do commit. Fora do teste, o
 * `email` vem do `GOATCOUNTER_EMAIL`. */
export function publicar({
  saida,
  vps,
  dizer,
  agora,
  ...plano
}: {
  saida: string
  vps: Vps
  dizer: (l: string) => void
  agora?: () => number
} & Parameters<typeof planoDoPublicar>[0]) {
  const etapas = planoDoPublicar(plano)
  const obra = mkdtempSync(join(tmpdir(), 'publicar-temestudo-'))
  try {
    // O `.output` inteiro: o Nitro serve o `public/` pelo próprio Node, e o
    // Nginx só faz proxy (`../nginx/temestudo.conf`).
    rodar('tar', ['-czf', join(obra, 'build.tar.gz'), '-C', saida, '.'])
    const frontend = resolve(saida, '..')
    copyFileSync(join(frontend, 'Dockerfile'), join(obra, 'Dockerfile'))
    for (const [nome] of CONFIGURACAO_DO_HOST)
      copyFileSync(join(frontend, 'nginx', nome), join(obra, nome))
    seguirOPlano({ etapas, vps, envio: obra, dizer, agora })
  } finally {
    rmSync(obra, { recursive: true, force: true })
  }
}

/** Volta a uma imagem que a VPS guardou: a do SHA pedido, ou a do deploy
 * anterior. O vhost fica como está. */
export function voltar({
  sha,
  vps,
  dizer,
  agora,
  lugares,
}: {
  sha?: string
  vps: Vps
  dizer: (l: string) => void
  agora?: () => number
} & Omit<Parameters<typeof planoDoVoltar>[0], 'sha'>) {
  const alvo = sha ?? vps.rodar('cat anterior 2>/dev/null || true').trim()
  if (!alvo)
    throw new Error('A VPS não guardou um deploy anterior: diga o SHA.')
  const etapas = planoDoVoltar({ sha: alvo, lugares })
  dizer(`Voltando para sha-${alvo}.`)
  seguirOPlano({ etapas, vps, dizer, agora })
}

/** A VPS das variáveis `VPS_*` do ambiente, ou nenhuma sem o `VPS_HOST`. */
function daLinhaDeComando(): Destino | undefined {
  const { VPS_HOST: host, VPS_SSH_KEY: chave } = process.env
  if (!host) return undefined
  // Validadas antes da primeira etapa (ADR 0032).
  const lidas = lerVariaveis(
    { VPS_PORT: umaPorta(22), VPS_USER: umUsuario('root') },
    process.env,
  )
  return {
    host,
    porta: String(lidas.VPS_PORT),
    usuario: lidas.VPS_USER,
    chave: arquivoDaChave(chave),
  }
}

if (import.meta.main) {
  const [modo, a, b] = process.argv.slice(2)
  const destino = daLinhaDeComando()
  const dizer = (linha: string) => console.log(`[vps] ${linha}`)
  const uso = () => {
    console.error(
      '[vps] Uso: VPS_HOST=… [VPS_USER=root] [VPS_PORT=22] [VPS_SSH_KEY=…] node scripts/vps.ts --publicar <.output> <sha> | --voltar [<sha>]',
    )
    process.exit(1)
  }
  if (!destino) uso()
  else if (modo === '--publicar' && a && b)
    publicar({
      saida: resolve(a),
      sha: b,
      // Validado antes da primeira etapa (ADR 0032).
      email: lerVariaveis({ GOATCOUNTER_EMAIL: emailOpcional }, process.env)
        .GOATCOUNTER_EMAIL,
      vps: pelaSsh(destino),
      dizer,
    })
  else if (modo === '--voltar') voltar({ sha: a, vps: pelaSsh(destino), dizer })
  else uso()
}
