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
// O contêiner novo sobe na porta livre do par, ao lado do antigo, e o Nginx
// só passa a ele depois que ele responde. O antigo para depois que os workers
// velhos do Nginx terminam os pedidos que tinham. Se algo falha antes do
// reload, o que estava no ar segue no ar.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { arquivoDaChave } from './chave-ssh.ts'

export type Vps = {
  host: string
  porta: string
  usuario: string
  chave?: string
}

/** O app na VPS, que só serve este site. O GoatCounter (#35) fica fora
 * deste par, num contêiner próprio. */
export const APP = {
  container: 'temestudo-app',
  pasta: '/opt/temestudo',
  portas: [3011, 3031],
  host: 'temestudo.com',
  /** O include de uma linha de onde o vhost lê a porta (`../nginx/temestudo.conf`). */
  include: '/etc/nginx/temestudo/temestudo-app.conf',
  vhost: '/etc/nginx/sites-available/temestudo.conf',
} as const

/** A configuração do host que sai de `../nginx/` em cada deploy: o nome no
 * repositório e o caminho na VPS. */
export const CONFIGURACAO_DO_HOST = [
  ['log-sem-query.conf', '/etc/nginx/conf.d/temestudo-log-sem-query.conf'],
  ['temestudo.conf', APP.vhost],
  ['tls.conf', '/etc/nginx/temestudo/tls.conf'],
  ['logrotate-temestudo', '/etc/logrotate.d/temestudo'],
] as const

/** Vai para a linha de comando do `ssh`: só um SHA passa. */
const SHA = /^[0-9a-f]{7,40}$/

function opcoes({ porta, chave }: Vps, portaComo: '-p' | '-P') {
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

function rodar(comando: string, args: string[], cwd?: string, entrada?: string) {
  const r = spawnSync(comando, args, {
    cwd,
    input: entrada,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  })
  if (r.status !== 0) throw new Error(`${comando} falhou (saiu com ${r.status}).`)
  return r.stdout
}

/** Um script bash na pasta do app na VPS, pelo stdin do `ssh`. */
function naVps(vps: Vps, script: string) {
  return rodar(
    'ssh',
    [...opcoes(vps, '-p'), `${vps.usuario}@${vps.host}`, 'bash -s'],
    undefined,
    `set -euo pipefail\nmkdir -p ${APP.pasta}\ncd ${APP.pasta}\n${script}`,
  )
}

/** O reload do Nginx na troca, como no Festival. O reload sobe workers novos,
 * que já falam com a porta nova, e os velhos terminam os pedidos que tinham
 * com a antiga. Espera os PIDs deles saírem, até 30 s, antes de parar o
 * contêiner antigo: parar antes dá 502. */
const RECARREGAR_O_NGINX = `VELHOS=$(pgrep -P "$(cat /run/nginx.pid)" || true)
systemctl reload nginx
for i in $(seq 1 300); do
  VIVOS=0
  for P in $VELHOS; do
    if [ -d "/proc/$P" ]; then VIVOS=1; fi
  done
  if [ "$VIVOS" = 0 ]; then break; fi
  sleep 0.1
done`

/** A imagem anterior fica, para voltar a ela, e as de antes dela saem. O
 * `|| true`: no primeiro deploy o grep não acha nada e sai com 1. */
function imagensDeAntes(sha: string) {
  return String.raw`{ docker images ${APP.container} --format '{{.Tag}}' | grep -vx "sha-${sha}" || true; } | tail -n +2 \
  | while read -r TAG; do docker rmi "${APP.container}:$TAG" >/dev/null || true; done`
}

/** A imagem, montada na VPS a partir do envio, e a configuração do host que
 * veio junto, guardada em `envio/` para a troca instalar. */
function montarAImagem(sha: string) {
  return String.raw`exec 9>publicar.lock
flock -w 600 9 || { echo "Outro deploy está rodando na VPS há 10 min." >&2; exit 1; }
rm -rf envio/build
mkdir -p envio/build
tar -xzf envio/build.tar.gz -C envio/build
rm -f envio/build.tar.gz
docker build -q -f envio/Dockerfile -t ${APP.container}:sha-${sha} envio/build >/dev/null
rm -rf envio/build
echo "Imagem ${APP.container}:sha-${sha} montada."
`
}

/** A troca sem janela. Com `comConfiguracao`, o vhost e a rotação que vieram
 * em `envio/` entram junto com a porta nova, e voltam ao que eram se o
 * `nginx -t` recusar. */
export function trocarOApp(sha: string, comConfiguracao: boolean) {
  const { container, portas, host, include, vhost } = APP
  const destinos = CONFIGURACAO_DO_HOST.map(([, destino]) => `"${destino}"`).join(' ')
  const instalar = comConfiguracao
    ? String.raw`install -d -m 755 /var/log/nginx/temestudo /opt/temestudo/acme /etc/nginx/temestudo
for ARQ in ${destinos}; do
  if [ -f "$ARQ" ]; then cp -a "$ARQ" "$ARQ.anterior"; else rm -f "$ARQ.anterior"; fi
done
${CONFIGURACAO_DO_HOST.map(([nome, destino]) => `install -o root -g root -m 644 envio/${nome} "${destino}"`).join('\n')}
ln -sfn "${vhost}" /etc/nginx/sites-enabled/temestudo.conf
# O site padrão do pacote também quer o default_server da porta 80, e o
# vhost provisório do preparar-vps.sh já cumpriu o papel dele.
rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/temestudo-acme.conf`
    : ''
  const desfazer = comConfiguracao
    ? String.raw`  for ARQ in ${destinos}; do
    if [ -f "$ARQ.anterior" ]; then mv -f "$ARQ.anterior" "$ARQ"; else rm -f "$ARQ"; fi
  done
  if [ ! -f "${vhost}" ]; then rm -f /etc/nginx/sites-enabled/temestudo.conf; fi`
    : ''
  return String.raw`exec 9>publicar.lock
flock -w 600 9 || { echo "Outro deploy está rodando na VPS há 10 min." >&2; exit 1; }
docker image inspect ${container}:sha-${sha} >/dev/null 2>&1 || { echo "A VPS não tem a imagem ${container}:sha-${sha}." >&2; exit 1; }
INCLUDE=${include}
NO_AR=$(grep -o '127\.0\.0\.1:[0-9]*' "$INCLUDE" 2>/dev/null | cut -d: -f2 || true)
if [ "$NO_AR" = "${portas[0]}" ]; then NOVA=${portas[1]}; else NOVA=${portas[0]}; fi
NOVO=${container}-novo
docker rm -f "$NOVO" >/dev/null 2>&1 || true
docker run -d --name "$NOVO" --restart unless-stopped --init \
  --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
  --log-opt max-size=10m --log-opt max-file=3 \
  -p "127.0.0.1:$NOVA:3000" ${container}:sha-${sha} >/dev/null
SUBIU=0
for i in $(seq 1 30); do
  if curl -fs -o /dev/null -H 'Host: ${host}' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$NOVA/"; then
    SUBIU=1; break
  fi
  sleep 2
done
if [ "$SUBIU" != 1 ]; then
  echo "O app novo não respondeu em / na porta $NOVA; o que estava no ar segue. Últimos logs:" >&2
  docker logs --tail 50 "$NOVO" >&2
  docker rm -f "$NOVO" >/dev/null
  exit 1
fi
mkdir -p "$(dirname "$INCLUDE")"
if [ -f "$INCLUDE" ]; then cp -a "$INCLUDE" "$INCLUDE.anterior"; else rm -f "$INCLUDE.anterior"; fi
${instalar}
printf 'proxy_pass http://127.0.0.1:%s;\n' "$NOVA" > "$INCLUDE"
if ! nginx -t 2>/tmp/temestudo-nginx-t.txt; then
  cat /tmp/temestudo-nginx-t.txt >&2
  if [ -f "$INCLUDE.anterior" ]; then mv -f "$INCLUDE.anterior" "$INCLUDE"; else rm -f "$INCLUDE"; fi
${desfazer}
  docker rm -f "$NOVO" >/dev/null
  echo "O nginx -t recusou a configuração nova; o app antigo segue no ar." >&2
  exit 1
fi
${RECARREGAR_O_NGINX}
if docker inspect ${container} >/dev/null 2>&1; then
  docker stop --timeout 30 ${container} >/dev/null || true
fi
docker rm -f ${container} >/dev/null 2>&1 || true
docker rename "$NOVO" ${container}
NO_AR_ANTES=$(cat no-ar 2>/dev/null || true)
if [ -n "$NO_AR_ANTES" ] && [ "$NO_AR_ANTES" != "${sha}" ]; then echo "$NO_AR_ANTES" > anterior; fi
echo "${sha}" > no-ar
${imagensDeAntes(sha)}
echo "App sha-${sha} no ar na porta $NOVA, para ${host}."
`
}

/** Publica o `.output` do build com o SHA do commit. */
export function publicar({ saida, sha, vps, dizer }: { saida: string; sha: string; vps: Vps; dizer: (l: string) => void }) {
  if (!SHA.test(sha)) throw new Error(`"${sha}" não é um SHA.`)
  const obra = mkdtempSync(join(tmpdir(), 'publicar-temestudo-'))
  try {
    // O `.output` inteiro: o Nitro serve o `public/` pelo próprio Node, e o
    // Nginx só faz proxy (`../nginx/temestudo.conf`).
    rodar('tar', ['-czf', join(obra, 'build.tar.gz'), '-C', saida, '.'])
    const frontend = resolve(saida, '..')
    copyFileSync(join(frontend, 'Dockerfile'), join(obra, 'Dockerfile'))
    const nomes = CONFIGURACAO_DO_HOST.map(([nome]) => nome)
    for (const nome of nomes) copyFileSync(join(frontend, 'nginx', nome), join(obra, nome))
    naVps(vps, 'rm -rf envio && mkdir -p envio')
    dizer('O build vai para a VPS.')
    rodar(
      'scp',
      [
        ...opcoes(vps, '-P'),
        'build.tar.gz',
        'Dockerfile',
        ...nomes,
        `${vps.usuario}@${vps.host}:${APP.pasta}/envio/`,
      ],
      obra,
    )
    dizer(naVps(vps, montarAImagem(sha)).trim())
    dizer(naVps(vps, trocarOApp(sha, true)).trim())
  } finally {
    rmSync(obra, { recursive: true, force: true })
  }
}

/** Volta a uma imagem que a VPS guardou: a do SHA pedido, ou a do deploy
 * anterior. O vhost fica como está. */
export function voltar({ sha, vps, dizer }: { sha?: string; vps: Vps; dizer: (l: string) => void }) {
  const alvo = sha ?? naVps(vps, 'cat anterior 2>/dev/null || true').trim()
  if (!alvo) throw new Error('A VPS não guardou um deploy anterior: diga o SHA.')
  if (!SHA.test(alvo)) throw new Error(`"${alvo}" não é um SHA.`)
  dizer(`Voltando para sha-${alvo}.`)
  dizer(naVps(vps, trocarOApp(alvo, false)).trim())
}

/** A VPS das variáveis `VPS_*` do ambiente, ou nenhuma sem o `VPS_HOST`. */
function daLinhaDeComando(): Vps | undefined {
  const { VPS_HOST: host, VPS_PORT: porta = '22', VPS_USER: usuario = 'root', VPS_SSH_KEY: chave } =
    process.env
  return host ? { host, porta: porta || '22', usuario: usuario || 'root', chave: arquivoDaChave(chave) } : undefined
}

if (import.meta.main) {
  const [modo, a, b] = process.argv.slice(2)
  const vps = daLinhaDeComando()
  const dizer = (linha: string) => console.log(`[vps] ${linha}`)
  const uso = () => {
    console.error(
      '[vps] Uso: VPS_HOST=… [VPS_USER=root] [VPS_PORT=22] [VPS_SSH_KEY=…] node scripts/vps.ts --publicar <.output> <sha> | --voltar [<sha>]',
    )
    process.exit(1)
  }
  if (!vps) uso()
  else if (modo === '--publicar' && a && b) publicar({ saida: resolve(a), sha: b, vps, dizer })
  else if (modo === '--voltar') voltar({ sha: a, vps, dizer })
  else uso()
}
