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

type Vps = {
  host: string
  porta: string
  usuario: string
  chave?: string
}

/** O app na VPS, que só serve este site. O GoatCounter (#35) fica fora
 * deste par, num contêiner próprio. */
const APP = {
  container: 'temestudo-app',
  pasta: '/opt/temestudo',
  portas: [3011, 3031],
  host: 'temestudo.com',
  /** O include de uma linha de onde o vhost lê a porta (`../nginx/temestudo.conf`). */
  include: '/etc/nginx/temestudo/temestudo-app.conf',
  vhost: '/etc/nginx/sites-available/temestudo.conf',
} as const

/** O GoatCounter (#35) em stats.temestudo.com: um contêiner só, fora do par
 * do app, com o SQLite num volume do Docker. A imagem é fixa: trocar a versão
 * aqui troca o contêiner no próximo deploy, e os dados ficam no volume. */
export const STATS = {
  container: 'temestudo-stats',
  imagem: 'arp242/goatcounter:2.7.0',
  volume: 'temestudo-stats',
  porta: 3051,
  host: 'stats.temestudo.com',
  vhost: '/etc/nginx/sites-available/temestudo-stats.conf',
} as const

/** A configuração do host que sai de `../nginx/` em cada deploy: o nome no
 * repositório e o caminho na VPS. */
export const CONFIGURACAO_DO_HOST = [
  ['log-sem-query.conf', '/etc/nginx/conf.d/temestudo-log-sem-query.conf'],
  ['temestudo.conf', APP.vhost],
  ['temestudo-stats.conf', STATS.vhost],
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
function trocarOApp(sha: string, comConfiguracao: boolean) {
  const { container, portas, host, include, vhost } = APP
  const destinos = CONFIGURACAO_DO_HOST.map(([, destino]) => `"${destino}"`).join(' ')
  const instalar = comConfiguracao
    ? String.raw`install -d -m 755 /var/log/nginx/temestudo /opt/temestudo/acme /etc/nginx/temestudo
for ARQ in ${destinos}; do
  if [ -f "$ARQ" ]; then cp -a "$ARQ" "$ARQ.anterior"; else rm -f "$ARQ.anterior"; fi
done
${CONFIGURACAO_DO_HOST.map(([nome, destino]) => `install -o root -g root -m 644 envio/${nome} "${destino}"`).join('\n')}
ln -sfn "${vhost}" /etc/nginx/sites-enabled/temestudo.conf
ln -sfn "${STATS.vhost}" /etc/nginx/sites-enabled/temestudo-stats.conf
# O site padrão do pacote também quer o default_server da porta 80, e o
# vhost provisório do preparar-vps.sh já cumpriu o papel dele.
rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/temestudo-acme.conf`
    : ''
  const desfazer = comConfiguracao
    ? String.raw`  for ARQ in ${destinos}; do
    if [ -f "$ARQ.anterior" ]; then mv -f "$ARQ.anterior" "$ARQ"; else rm -f "$ARQ"; fi
  done
  if [ ! -f "${vhost}" ]; then rm -f /etc/nginx/sites-enabled/temestudo.conf; fi
  if [ ! -f "${STATS.vhost}" ]; then rm -f /etc/nginx/sites-enabled/temestudo-stats.conf; fi`
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

/** O contêiner do GoatCounter: o `STATS`, ou outro no teste local. */
export type ConteinerDoStats = { readonly [K in keyof typeof STATS]: (typeof STATS)[K] extends number ? number : string }

/** O que o GoatCounter coleta: só referência (2), tamanho de tela (8) e país
 * (16). Sem sessões (128), região (32), navegador e sistema (4), idioma (64). */
const COLETA_DO_STATS = 2 + 8 + 16
/** Os dias que o GoatCounter guarda as visitas. */
const RETENCAO_DO_STATS = 31
/** O e-mail do login do GoatCounter quando o `GOATCOUNTER_EMAIL` não diz outro. */
const EMAIL_DO_STATS = 'admin@temestudo.com'
/** Onde a VPS guarda a senha que o primeiro deploy sorteia (root, 600). */
const SENHA_DO_STATS = `${APP.pasta}/goatcounter-senha`

/** O e-mail vai dentro de um script bash: só o formato simples passa. */
const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

/** O contêiner do GoatCounter, criado ou trocado só quando falta, parou ou a
 * imagem de `STATS` mudou. O banco fica no volume, que sobrevive à troca.
 *
 * Sem site criado, a tela inicial do GoatCounter deixa qualquer um criar a
 * conta. Por isso o site e o usuário saem daqui, antes de o vhost de
 * `stats` entrar no Nginx, com uma senha sorteada e gravada em
 * `arquivoDaSenha`. Se a criação falha, o contêiner para, e a tela de criar
 * conta não fica no ar. A coleta e a retenção voltam ao combinado a cada
 * deploy. Os parâmetros além do e-mail servem ao teste local
 * (`stats.docker.test.ts`). */
export function garantirOStats({
  email = EMAIL_DO_STATS,
  stats = STATS,
  arquivoDaSenha = SENHA_DO_STATS,
}: { email?: string; stats?: ConteinerDoStats; arquivoDaSenha?: string } = {}) {
  if (!EMAIL.test(email)) throw new Error(`"${email}" não é um e-mail que o deploy aceite.`)
  const { container, imagem, volume, porta, host } = stats
  const gc = `docker exec ${container} goatcounter`
  return String.raw`docker volume create ${volume} >/dev/null
ATUAL=$(docker inspect -f '{{.Config.Image}}' ${container} 2>/dev/null || true)
RODANDO=$(docker inspect -f '{{.State.Running}}' ${container} 2>/dev/null || true)
if [ "$ATUAL" = "${imagem}" ] && [ "$RODANDO" = true ]; then
  echo "GoatCounter ${imagem} já no ar na porta ${porta}."
else
  docker pull -q ${imagem} >/dev/null
  docker rm -f ${container} >/dev/null 2>&1 || true
  docker run -d --name ${container} --restart unless-stopped --init \
    --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
    --log-opt max-size=10m --log-opt max-file=3 \
    -v ${volume}:/home/goatcounter/goatcounter-data \
    -p "127.0.0.1:${porta}:8080" ${imagem} serve -listen :8080 -tls http -automigrate >/dev/null
  echo "GoatCounter ${imagem} no ar na porta ${porta}."
fi
# Até 30 s para o GoatCounter responder, qualquer status.
esperar_o_stats() {
  for i in $(seq 1 30); do
    if [ "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${porta}/" || true)" != 000 ]; then return 0; fi
    sleep 1
  done
}
esperar_o_stats
if ! ${gc} db show site -find ${host} >/dev/null 2>&1; then
  # A senha vai para o arquivo antes do site, para nunca existir um login
  # que ninguém sabe. Ela passa na linha de comando do docker exec: a VPS só
  # tem o root.
  SENHA=$(head -c 64 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 40)
  ( umask 077; printf '%s\n' "$SENHA" > "${arquivoDaSenha}.novo" )
  chmod 600 "${arquivoDaSenha}.novo"
  mv -f "${arquivoDaSenha}.novo" "${arquivoDaSenha}"
  if ! ${gc} db create site -vhost ${host} -user.email '${email}' -user.password "$SENHA" >/dev/null; then
    docker stop ${container} >/dev/null || true
    rm -f "${arquivoDaSenha}"
    echo "Não deu para criar o site ${host}; o GoatCounter ficou parado, sem a tela de criar conta no ar." >&2
    exit 1
  fi
  echo "GoatCounter: site ${host} criado, login ${email}, senha em ${arquivoDaSenha}."
fi
CONFIG=$(${gc} db query "select json_extract(settings, '$.collect') || ',' || json_extract(settings, '$.data_retention') from sites where cname = '${host}'" | tail -n 1)
if [ "$CONFIG" != "${COLETA_DO_STATS},${RETENCAO_DO_STATS}" ]; then
  ${gc} db query "update sites set settings = json_set(settings, '$.collect', ${COLETA_DO_STATS}, '$.data_retention', ${RETENCAO_DO_STATS}) where cname = '${host}'" >/dev/null
  # O GoatCounter lê a configuração do site ao subir.
  docker restart ${container} >/dev/null
  esperar_o_stats
  echo "GoatCounter: coleta ${COLETA_DO_STATS} (referência, tela, país) e retenção de ${RETENCAO_DO_STATS} dias aplicadas."
fi
`
}

/** Para o GoatCounter que está no ar sem o site criado. */
export function pararOStatsSemSite(stats: ConteinerDoStats = STATS) {
  return `if docker inspect ${stats.container} >/dev/null 2>&1 \\
  && ! docker exec ${stats.container} goatcounter db show site -find ${stats.host} >/dev/null 2>&1; then
  docker stop ${stats.container} >/dev/null || true
  echo "GoatCounter parado: sem site criado, a tela de criar conta ficaria aberta."
fi
`
}

/** Publica o `.output` do build com o SHA do commit. */
function publicar({ saida, sha, vps, dizer }: { saida: string; sha: string; vps: Vps; dizer: (l: string) => void }) {
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
    // O GoatCounter fora do ar não segura o site: o deploy segue com um aviso.
    try {
      dizer(naVps(vps, garantirOStats({ email: process.env.GOATCOUNTER_EMAIL || undefined })).trim())
    } catch (erro) {
      dizer(`Aviso: o GoatCounter não subiu (${(erro as Error).message}). O site segue.`)
      // Um GoatCounter sem site no ar mostra a tela de criar conta a quem chegar.
      try {
        dizer(naVps(vps, pararOStatsSemSite()).trim())
      } catch {
        dizer('Aviso: não deu para conferir se o GoatCounter ficou sem site.')
      }
    }
    dizer(naVps(vps, trocarOApp(sha, true)).trim())
  } finally {
    rmSync(obra, { recursive: true, force: true })
  }
}

/** Volta a uma imagem que a VPS guardou: a do SHA pedido, ou a do deploy
 * anterior. O vhost fica como está. */
function voltar({ sha, vps, dizer }: { sha?: string; vps: Vps; dizer: (l: string) => void }) {
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
