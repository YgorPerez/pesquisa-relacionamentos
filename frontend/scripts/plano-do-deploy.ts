// O plano do deploy: o que sobe para a VPS, o que troca e o que apaga, e em
// que etapas (ADR 0007). Aqui só se monta texto, os scripts bash que cada
// etapa roda na VPS, a partir das listas de baixo (`CONFIGURACAO_DO_HOST`,
// `ENVIO`). Quem fala com a VPS é o `vps.ts`, que segue o plano pelo SSH, e
// o `vps.test.ts` segue o mesmo plano num bash com um docker de mentira
// (`docker-de-mentira.ts`).
//
// Molde: o Festival dos Macacos, que separa assim o `plano-do-deploy.ts` do
// `vps.ts`.
//
// Roda no `node` puro, que lê TypeScript sozinho: só sintaxe que ele apaga.

/** O app na VPS, que só serve este site. O GoatCounter (#35) fica fora
 * deste par, num contêiner próprio. */
const APP = {
  container: 'temestudo-app',
  pasta: '/opt/temestudo',
  portas: [3011, 3031],
  host: 'temestudo.cloud',
  /** O include de uma linha de onde o vhost lê a porta (`../nginx/temestudo.conf`). */
  include: '/etc/nginx/temestudo/temestudo-app.conf',
  vhost: '/etc/nginx/sites-available/temestudo.conf',
} as const

/** O GoatCounter (#35) em stats.temestudo.cloud: um contêiner só, fora do par
 * do app, com o SQLite num volume do Docker. A imagem é fixa: trocar a versão
 * aqui troca o contêiner no próximo deploy, e os dados ficam no volume. */
export const STATS = {
  container: 'temestudo-stats',
  imagem: 'arp242/goatcounter:2.7.0',
  volume: 'temestudo-stats',
  porta: 3051,
  host: 'stats.temestudo.cloud',
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

/** O que sobe para `envio/` na VPS em cada publicação: o `.output` num tar,
 * o `Dockerfile` e a configuração do host. */
const ENVIO = [
  'build.tar.gz',
  'Dockerfile',
  ...CONFIGURACAO_DO_HOST.map(([nome]) => nome),
] as const

/** Vai para a linha de comando do `ssh`: só um SHA passa. */
const SHA = /^[0-9a-f]{7,40}$/

/** Os caminhos da VPS que os scripts tocam. Na VPS a raiz é `/`; no teste é
 * uma pasta temporária, e o script é o mesmo. */
export type Lugares = ReturnType<typeof lugaresNaVps>

export function lugaresNaVps(raiz = '') {
  const em = (caminho: string) => `${raiz}${caminho}`
  return {
    pasta: em(APP.pasta),
    include: em(APP.include),
    vhost: em(APP.vhost),
    vhostDoStats: em(STATS.vhost),
    configuracao: CONFIGURACAO_DO_HOST.map(
      ([nome, destino]) => [nome, em(destino)] as const,
    ),
    /** As pastas que o vhost e a rotação esperam encontrar. */
    pastasDoHost: [
      em('/var/log/nginx/temestudo'),
      em(`${APP.pasta}/acme`),
      em('/etc/nginx/temestudo'),
    ],
    sitesEnabled: em('/etc/nginx/sites-enabled'),
    pidDoNginx: em('/run/nginx.pid'),
    saidaDoNginxT: em('/tmp/temestudo-nginx-t.txt'),
    senhaDoStats: em(`${APP.pasta}/goatcounter-senha`),
  }
}

const NA_VPS = lugaresNaVps()

/** O começo de todo script na VPS: para no primeiro erro, na pasta do app. */
export function prologo(lugares: Lugares = NA_VPS) {
  return `set -euo pipefail\nmkdir -p ${lugares.pasta}\ncd ${lugares.pasta}\n`
}

/** O reload do Nginx na troca, como no Festival. O reload sobe workers novos,
 * que já falam com a porta nova, e os velhos terminam os pedidos que tinham
 * com a antiga. Espera os PIDs deles saírem, até 30 s, antes de parar o
 * contêiner antigo: parar antes dá 502. */
function recarregarONginx(pid: string) {
  return `VELHOS=$(pgrep -P "$(cat ${pid})" || true)
systemctl reload nginx
for i in $(seq 1 300); do
  VIVOS=0
  for P in $VELHOS; do
    if [ -d "/proc/$P" ]; then VIVOS=1; fi
  done
  if [ "$VIVOS" = 0 ]; then break; fi
  sleep 0.1
done`
}

/** A imagem anterior fica, para voltar a ela, e as de antes dela saem. O
 * `|| true`: no primeiro deploy o grep não acha nada e sai com 1. */
function imagensDeAntes(sha: string) {
  return String.raw`{ docker images ${APP.container} --format '{{.Tag}}' | grep -vx "sha-${sha}" || true; } | tail -n +2 \
  | while read -r TAG; do docker rmi "${APP.container}:$TAG" >/dev/null || true; done`
}

/** Um deploy por vez na VPS. */
const TRAVA = String.raw`exec 9>publicar.lock
flock -w 600 9 || { echo "Outro deploy está rodando na VPS há 10 min." >&2; exit 1; }`

/** A imagem, montada na VPS a partir do envio, e a configuração do host que
 * veio junto, guardada em `envio/` para a troca instalar. */
function montarAImagem(sha: string) {
  return String.raw`${TRAVA}
rm -rf envio/build
mkdir -p envio/build
tar -xzf envio/build.tar.gz -C envio/build
rm -f envio/build.tar.gz
docker build -q -f envio/Dockerfile -t ${APP.container}:sha-${sha} envio/build >/dev/null
rm -rf envio/build
echo "Imagem ${APP.container}:sha-${sha} montada."
`
}

/** A troca sem janela. O contêiner novo sobe na porta livre do par, ao lado
 * do antigo, e o Nginx só passa a ele depois que ele responde. O antigo para
 * depois que os workers velhos do Nginx terminam os pedidos que tinham. Se
 * algo falha antes do reload, o que estava no ar segue no ar.
 *
 * Com `comConfiguracao`, o vhost e a rotação que vieram em `envio/` entram
 * junto com a porta nova, e voltam ao que eram se o `nginx -t` recusar. */
function trocarOApp(
  sha: string,
  comConfiguracao: boolean,
  lugares: Lugares = NA_VPS,
) {
  const { container, portas, host } = APP
  const { include, vhost, vhostDoStats, configuracao, sitesEnabled } = lugares
  const destinos = configuracao.map(([, destino]) => `"${destino}"`).join(' ')
  const instalar = comConfiguracao
    ? String.raw`install -d -m 755 ${lugares.pastasDoHost.join(' ')}
for ARQ in ${destinos}; do
  if [ -f "$ARQ" ]; then cp -a "$ARQ" "$ARQ.anterior"; else rm -f "$ARQ.anterior"; fi
done
${configuracao.map(([nome, destino]) => `install -o root -g root -m 644 envio/${nome} "${destino}"`).join('\n')}
ln -sfn "${vhost}" ${sitesEnabled}/temestudo.conf
ln -sfn "${vhostDoStats}" ${sitesEnabled}/temestudo-stats.conf
# O site padrão do pacote também quer o default_server da porta 80, e o
# vhost provisório do preparar-vps.sh já cumpriu o papel dele.
rm -f ${sitesEnabled}/default ${sitesEnabled}/temestudo-acme.conf`
    : ''
  const desfazer = comConfiguracao
    ? String.raw`  for ARQ in ${destinos}; do
    if [ -f "$ARQ.anterior" ]; then mv -f "$ARQ.anterior" "$ARQ"; else rm -f "$ARQ"; fi
  done
  if [ ! -f "${vhost}" ]; then rm -f ${sitesEnabled}/temestudo.conf; fi
  if [ ! -f "${vhostDoStats}" ]; then rm -f ${sitesEnabled}/temestudo-stats.conf; fi`
    : ''
  return String.raw`${TRAVA}
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
if ! nginx -t 2>${lugares.saidaDoNginxT}; then
  cat ${lugares.saidaDoNginxT} >&2
  if [ -f "$INCLUDE.anterior" ]; then mv -f "$INCLUDE.anterior" "$INCLUDE"; else rm -f "$INCLUDE"; fi
${desfazer}
  docker rm -f "$NOVO" >/dev/null
  echo "O nginx -t recusou a configuração nova; o app antigo segue no ar." >&2
  exit 1
fi
${recarregarONginx(lugares.pidDoNginx)}
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
export type ConteinerDoStats = {
  readonly [K in keyof typeof STATS]: (typeof STATS)[K] extends number
    ? number
    : string
}

/** O que o GoatCounter coleta: só referência (2), tamanho de tela (8) e país
 * (16). Sem sessões (128), região (32), navegador e sistema (4), idioma (64). */
const COLETA_DO_STATS = 2 + 8 + 16
/** Os dias que o GoatCounter guarda as visitas. */
const RETENCAO_DO_STATS = 31
/** O e-mail do login do GoatCounter quando o `GOATCOUNTER_EMAIL` não diz outro. */
const EMAIL_DO_STATS = 'admin@temestudo.cloud'

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
 * deploy. Os parâmetros além do e-mail servem aos testes
 * (`vps.test.ts`, `stats.docker.test.ts`). */
export function garantirOStats({
  email = EMAIL_DO_STATS,
  stats = STATS,
  arquivoDaSenha = NA_VPS.senhaDoStats,
}: { email?: string; stats?: ConteinerDoStats; arquivoDaSenha?: string } = {}) {
  if (!EMAIL.test(email))
    throw new Error(`"${email}" não é um e-mail que o deploy aceite.`)
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

/** Uma etapa do deploy: um script na VPS, que o log cronometra pelo nome. */
export type Etapa = {
  nome: string
  /** Antes do script, o que sobe da pasta do envio para `envio/`. */
  envio?: readonly string[]
  script: string
  /** Sem isto, o script que falha para o deploy. Com isto, a falha vira
   * aviso, e o `script` daqui roda no lugar. */
  seFalhar?: { aviso: string; script: string; avisoSeFalharDeNovo: string }
}

/** O script, ou, se ele nem se monta (um e-mail que o deploy recusa), um
 * que falha na VPS com o motivo. Assim a falha cai no `seFalhar` da etapa,
 * como qualquer outra. */
function scriptOuFalha(montar: () => string) {
  try {
    return montar()
  } catch (erro) {
    const motivo = (erro as Error).message.replaceAll("'", String.raw`'\''`)
    return `printf '%s\\n' '${motivo}' >&2\nexit 1\n`
  }
}

/** A publicação de um build: o envio, a imagem, o GoatCounter, que não
 * segura o site, e a troca, que instala junto a configuração do host. */
export function planoDoPublicar({
  sha,
  email,
  lugares = NA_VPS,
}: {
  sha: string
  email?: string
  lugares?: Lugares
}): Etapa[] {
  if (!SHA.test(sha)) throw new Error(`"${sha}" não é um SHA.`)
  return [
    { nome: 'Envio', envio: ENVIO, script: 'rm -rf envio && mkdir -p envio' },
    { nome: 'Imagem', script: montarAImagem(sha) },
    {
      nome: 'GoatCounter',
      script: scriptOuFalha(() =>
        garantirOStats({ email, arquivoDaSenha: lugares.senhaDoStats }),
      ),
      seFalhar: {
        aviso: 'o GoatCounter não subiu',
        // Um GoatCounter sem site no ar mostra a tela de criar conta a quem chegar.
        script: pararOStatsSemSite(),
        avisoSeFalharDeNovo:
          'não deu para conferir se o GoatCounter ficou sem site.',
      },
    },
    { nome: 'Troca', script: trocarOApp(sha, true, lugares) },
  ]
}

/** A volta a uma imagem que a VPS guardou. O vhost fica como está. */
export function planoDoVoltar({
  sha,
  lugares = NA_VPS,
}: {
  sha: string
  lugares?: Lugares
}): Etapa[] {
  if (!SHA.test(sha)) throw new Error(`"${sha}" não é um SHA.`)
  return [{ nome: 'Troca', script: trocarOApp(sha, false, lugares) }]
}
