// The deploy plan: what goes up to the VPS, what is swapped and what is
// deleted, and in which steps (ADR 0007). Here only text is built, the bash
// scripts each step runs on the VPS, from the lists below (`HOST_CONFIG`,
// `UPLOAD`). What talks to the VPS is `vps.ts`, which follows the plan over
// SSH, and `vps.test.ts` follows the same plan in a bash with a fake docker
// (`fake-docker.ts`).
//
// Model: the Festival dos Macacos, which splits `plano-do-deploy.ts` from
// `vps.ts` this way.
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it
// strips.
//
// The names on the VPS (folders, files, containers, the lock) stay as the
// running server knows them: a renamed one would break the next swap or
// rollback.

/** The app on the VPS, which serves only this site. GoatCounter (#35) lives
 * outside this pair, in its own container. */
const APP = {
  container: 'temestudo-app',
  folder: '/opt/temestudo',
  ports: [3011, 3031],
  host: 'temestudo.cloud',
  /** The one-line include the vhost reads the port from
   * (`../nginx/temestudo.conf`). */
  include: '/etc/nginx/temestudo/temestudo-app.conf',
  vhost: '/etc/nginx/sites-available/temestudo.conf',
} as const

/** GoatCounter (#35) at stats.temestudo.cloud: a single container, outside
 * the app's pair, with SQLite in a Docker volume. The image is pinned:
 * changing the version here swaps the container on the next deploy, and the
 * data stays in the volume. */
export const STATS = {
  container: 'temestudo-stats',
  image: 'arp242/goatcounter:2.7.0',
  volume: 'temestudo-stats',
  port: 3051,
  host: 'stats.temestudo.cloud',
  vhost: '/etc/nginx/sites-available/temestudo-stats.conf',
} as const

/** The host configuration that comes from `../nginx/` on each deploy: the
 * name in the repository and the path on the VPS. */
export const HOST_CONFIG = [
  ['log-without-query.conf', '/etc/nginx/conf.d/temestudo-log-sem-query.conf'],
  ['temestudo.conf', APP.vhost],
  ['temestudo-stats.conf', STATS.vhost],
  ['tls.conf', '/etc/nginx/temestudo/tls.conf'],
  ['logrotate-temestudo', '/etc/logrotate.d/temestudo'],
] as const

/** What goes up to `envio/` on the VPS on each publish: the `.output` in a
 * tar, the `Dockerfile` and the host configuration. */
const UPLOAD = [
  'build.tar.gz',
  'Dockerfile',
  ...HOST_CONFIG.map(([name]) => name),
] as const

/** Goes on the `ssh` command line: only a SHA passes. */
const SHA = /^[0-9a-f]{7,40}$/

/** The VPS paths the scripts touch. On the VPS the root is `/`; in the test
 * it is a temporary folder, and the script is the same. */
export type VpsPaths = ReturnType<typeof vpsPaths>

export function vpsPaths(root = '') {
  const at = (path: string) => `${root}${path}`
  return {
    folder: at(APP.folder),
    include: at(APP.include),
    vhost: at(APP.vhost),
    statsVhost: at(STATS.vhost),
    config: HOST_CONFIG.map(([name, target]) => [name, at(target)] as const),
    /** The folders the vhost and the rotation expect to find. */
    hostFolders: [
      at('/var/log/nginx/temestudo'),
      at(`${APP.folder}/acme`),
      at('/etc/nginx/temestudo'),
    ],
    sitesEnabled: at('/etc/nginx/sites-enabled'),
    nginxPid: at('/run/nginx.pid'),
    nginxTOutput: at('/tmp/temestudo-nginx-t.txt'),
    statsPassword: at(`${APP.folder}/goatcounter-senha`),
  }
}

const ON_VPS = vpsPaths()

/** The start of every script on the VPS: stops at the first error, in the
 * app folder. */
export function prologue(paths: VpsPaths = ON_VPS) {
  return `set -euo pipefail\nmkdir -p ${paths.folder}\ncd ${paths.folder}\n`
}

/** The Nginx reload on the swap, as in the Festival. The reload starts new
 * workers, which already talk to the new port, and the old ones finish the
 * requests they had with the old one. Waits for their PIDs to exit, up to
 * 30 s, before stopping the old container: stopping before gives 502. */
function reloadNginx(pid: string) {
  return `OLD=$(pgrep -P "$(cat ${pid})" || true)
systemctl reload nginx
for i in $(seq 1 300); do
  ALIVE=0
  for P in $OLD; do
    if [ -d "/proc/$P" ]; then ALIVE=1; fi
  done
  if [ "$ALIVE" = 0 ]; then break; fi
  sleep 0.1
done`
}

/** The previous image stays, to roll back to it, and the ones before it go.
 * The `|| true`: on the first deploy grep finds nothing and exits with 1. */
function olderImages(sha: string) {
  return String.raw`{ docker images ${APP.container} --format '{{.Tag}}' | grep -vx "sha-${sha}" || true; } | tail -n +2 \
  | while read -r TAG; do docker rmi "${APP.container}:$TAG" >/dev/null || true; done`
}

/** One deploy at a time on the VPS. */
const LOCK = String.raw`exec 9>publicar.lock
flock -w 600 9 || { echo "Another deploy has been running on the VPS for 10 min." >&2; exit 1; }`

/** The image, built on the VPS from the upload, and the host configuration
 * that came with it, kept in `envio/` for the swap to install. */
function buildImage(sha: string) {
  return String.raw`${LOCK}
rm -rf envio/build
mkdir -p envio/build
tar -xzf envio/build.tar.gz -C envio/build
rm -f envio/build.tar.gz
docker build -q -f envio/Dockerfile -t ${APP.container}:sha-${sha} envio/build >/dev/null
rm -rf envio/build
echo "Image ${APP.container}:sha-${sha} built."
`
}

/** The swap with no downtime window. The new container starts on the pair's
 * free port, next to the old one, and Nginx only passes to it after it
 * answers. The old one stops after Nginx's old workers finish the requests
 * they had. If something fails before the reload, what was live stays live.
 *
 * With `withConfig`, the vhost and the rotation that came in `envio/` go in
 * together with the new port, and go back to what they were if `nginx -t`
 * refuses. */
function swapApp(sha: string, withConfig: boolean, paths: VpsPaths = ON_VPS) {
  const { container, ports, host } = APP
  const { include, vhost, statsVhost, config, sitesEnabled } = paths
  const targets = config.map(([, target]) => `"${target}"`).join(' ')
  const install = withConfig
    ? String.raw`install -d -m 755 ${paths.hostFolders.join(' ')}
for FILE in ${targets}; do
  if [ -f "$FILE" ]; then cp -a "$FILE" "$FILE.anterior"; else rm -f "$FILE.anterior"; fi
done
${config.map(([name, target]) => `install -o root -g root -m 644 envio/${name} "${target}"`).join('\n')}
ln -sfn "${vhost}" ${sitesEnabled}/temestudo.conf
ln -sfn "${statsVhost}" ${sitesEnabled}/temestudo-stats.conf
# The package's default site also wants port 80's default_server, and the
# temporary vhost from prepare-vps.sh has already done its job.
rm -f ${sitesEnabled}/default ${sitesEnabled}/temestudo-acme.conf`
    : ''
  const undo = withConfig
    ? String.raw`  for FILE in ${targets}; do
    if [ -f "$FILE.anterior" ]; then mv -f "$FILE.anterior" "$FILE"; else rm -f "$FILE"; fi
  done
  if [ ! -f "${vhost}" ]; then rm -f ${sitesEnabled}/temestudo.conf; fi
  if [ ! -f "${statsVhost}" ]; then rm -f ${sitesEnabled}/temestudo-stats.conf; fi`
    : ''
  return String.raw`${LOCK}
docker image inspect ${container}:sha-${sha} >/dev/null 2>&1 || { echo "The VPS does not have the image ${container}:sha-${sha}." >&2; exit 1; }
INCLUDE=${include}
LIVE=$(grep -o '127\.0\.0\.1:[0-9]*' "$INCLUDE" 2>/dev/null | cut -d: -f2 || true)
if [ "$LIVE" = "${ports[0]}" ]; then PORT=${ports[1]}; else PORT=${ports[0]}; fi
NEW=${container}-novo
docker rm -f "$NEW" >/dev/null 2>&1 || true
docker run -d --name "$NEW" --restart unless-stopped --init \
  --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
  --log-opt max-size=10m --log-opt max-file=3 \
  -p "127.0.0.1:$PORT:3000" ${container}:sha-${sha} >/dev/null
UP=0
for i in $(seq 1 30); do
  if curl -fs -o /dev/null -H 'Host: ${host}' -H 'X-Forwarded-Proto: https' "http://127.0.0.1:$PORT/"; then
    UP=1; break
  fi
  sleep 2
done
if [ "$UP" != 1 ]; then
  echo "The new app did not answer on / at port $PORT; what was live stays. Last logs:" >&2
  docker logs --tail 50 "$NEW" >&2
  docker rm -f "$NEW" >/dev/null
  exit 1
fi
mkdir -p "$(dirname "$INCLUDE")"
if [ -f "$INCLUDE" ]; then cp -a "$INCLUDE" "$INCLUDE.anterior"; else rm -f "$INCLUDE.anterior"; fi
${install}
printf 'proxy_pass http://127.0.0.1:%s;\n' "$PORT" > "$INCLUDE"
if ! nginx -t 2>${paths.nginxTOutput}; then
  cat ${paths.nginxTOutput} >&2
  if [ -f "$INCLUDE.anterior" ]; then mv -f "$INCLUDE.anterior" "$INCLUDE"; else rm -f "$INCLUDE"; fi
${undo}
  docker rm -f "$NEW" >/dev/null
  echo "nginx -t refused the new configuration; the old app stays live." >&2
  exit 1
fi
${reloadNginx(paths.nginxPid)}
if docker inspect ${container} >/dev/null 2>&1; then
  docker stop --timeout 30 ${container} >/dev/null || true
fi
docker rm -f ${container} >/dev/null 2>&1 || true
docker rename "$NEW" ${container}
LIVE_BEFORE=$(cat no-ar 2>/dev/null || true)
if [ -n "$LIVE_BEFORE" ] && [ "$LIVE_BEFORE" != "${sha}" ]; then echo "$LIVE_BEFORE" > anterior; fi
echo "${sha}" > no-ar
${olderImages(sha)}
echo "App sha-${sha} live on port $PORT, for ${host}."
`
}

/** The GoatCounter container: `STATS`, or another one in the local test. */
export type StatsContainer = {
  readonly [K in keyof typeof STATS]: (typeof STATS)[K] extends number
    ? number
    : string
}

/** What GoatCounter collects: only referrer (2), screen size (8) and country
 * (16). No sessions (128), region (32), browser and system (4), language
 * (64). */
const STATS_COLLECT = 2 + 8 + 16
/** The days GoatCounter keeps the visits. */
const STATS_RETENTION = 31
/** The GoatCounter login e-mail when `GOATCOUNTER_EMAIL` says nothing else. */
const STATS_EMAIL = 'admin@temestudo.cloud'

/** The e-mail goes inside a bash script: only the simple format passes. */
const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

/** The GoatCounter container, created or swapped only when it is missing,
 * stopped, or the `STATS` image changed. The database stays in the volume,
 * which survives the swap.
 *
 * With no site created, GoatCounter's home screen lets anyone create the
 * account. So the site and the user come from here, before the `stats` vhost
 * goes into Nginx, with a random password written to `passwordFile`. If the
 * creation fails, the container stops, and the create-account screen does
 * not stay live. Collection and retention go back to what was agreed on each
 * deploy. The parameters beyond the e-mail serve the tests (`vps.test.ts`,
 * `stats.docker.test.ts`). */
export function ensureStats({
  email = STATS_EMAIL,
  stats = STATS,
  passwordFile = ON_VPS.statsPassword,
}: { email?: string; stats?: StatsContainer; passwordFile?: string } = {}) {
  if (!EMAIL.test(email))
    throw new Error(`"${email}" is not an e-mail the deploy accepts.`)
  const { container, image, volume, port, host } = stats
  const gc = `docker exec ${container} goatcounter`
  return String.raw`docker volume create ${volume} >/dev/null
CURRENT=$(docker inspect -f '{{.Config.Image}}' ${container} 2>/dev/null || true)
RUNNING=$(docker inspect -f '{{.State.Running}}' ${container} 2>/dev/null || true)
if [ "$CURRENT" = "${image}" ] && [ "$RUNNING" = true ]; then
  echo "GoatCounter ${image} already live on port ${port}."
else
  docker pull -q ${image} >/dev/null
  docker rm -f ${container} >/dev/null 2>&1 || true
  docker run -d --name ${container} --restart unless-stopped --init \
    --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
    --log-opt max-size=10m --log-opt max-file=3 \
    -v ${volume}:/home/goatcounter/goatcounter-data \
    -p "127.0.0.1:${port}:8080" ${image} serve -listen :8080 -tls http -automigrate >/dev/null
  echo "GoatCounter ${image} live on port ${port}."
fi
# Up to 30 s for GoatCounter to answer, any status.
wait_for_stats() {
  for i in $(seq 1 30); do
    if [ "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${port}/" || true)" != 000 ]; then return 0; fi
    sleep 1
  done
}
wait_for_stats
if ! ${gc} db show site -find ${host} >/dev/null 2>&1; then
  # The password goes to the file before the site, so there is never a login
  # nobody knows. It passes on the docker exec command line: the VPS only
  # has root.
  PASSWORD=$(head -c 64 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 40)
  ( umask 077; printf '%s\n' "$PASSWORD" > "${passwordFile}.novo" )
  chmod 600 "${passwordFile}.novo"
  mv -f "${passwordFile}.novo" "${passwordFile}"
  if ! ${gc} db create site -vhost ${host} -user.email '${email}' -user.password "$PASSWORD" >/dev/null; then
    docker stop ${container} >/dev/null || true
    rm -f "${passwordFile}"
    echo "Could not create the site ${host}; GoatCounter was left stopped, without the create-account screen live." >&2
    exit 1
  fi
  echo "GoatCounter: site ${host} created, login ${email}, password in ${passwordFile}."
fi
CONFIG=$(${gc} db query "select json_extract(settings, '$.collect') || ',' || json_extract(settings, '$.data_retention') from sites where cname = '${host}'" | tail -n 1)
if [ "$CONFIG" != "${STATS_COLLECT},${STATS_RETENTION}" ]; then
  ${gc} db query "update sites set settings = json_set(settings, '$.collect', ${STATS_COLLECT}, '$.data_retention', ${STATS_RETENTION}) where cname = '${host}'" >/dev/null
  # GoatCounter reads the site configuration on startup.
  docker restart ${container} >/dev/null
  wait_for_stats
  echo "GoatCounter: collection ${STATS_COLLECT} (referrer, screen, country) and retention of ${STATS_RETENTION} days applied."
fi
`
}

/** Stops the GoatCounter that is live without the site created. */
export function stopStatsWithoutSite(stats: StatsContainer = STATS) {
  return `if docker inspect ${stats.container} >/dev/null 2>&1 \\
  && ! docker exec ${stats.container} goatcounter db show site -find ${stats.host} >/dev/null 2>&1; then
  docker stop ${stats.container} >/dev/null || true
  echo "GoatCounter stopped: with no site created, the create-account screen would stay open."
fi
`
}

/** A deploy step: a script on the VPS, which the log times by name. */
export type Step = {
  name: string
  /** Before the script, what goes up from the upload folder to `envio/`. */
  upload?: readonly string[]
  script: string
  /** Without this, a failing script stops the deploy. With this, the
   * failure becomes a warning, and the `script` here runs instead. */
  onFailure?: { warning: string; script: string; warningIfFailsAgain: string }
}

/** The script, or, if it cannot even be built (an e-mail the deploy
 * refuses), one that fails on the VPS with the reason. So the failure falls
 * into the step's `onFailure`, like any other. */
function scriptOrFailure(build: () => string) {
  try {
    return build()
  } catch (error) {
    const reason = (error as Error).message.replaceAll("'", String.raw`'\''`)
    return `printf '%s\\n' '${reason}' >&2\nexit 1\n`
  }
}

/** Publishing a build: the upload, the image, GoatCounter, which does not
 * hold the site back, and the swap, which installs the host configuration
 * along with it. */
export function publishPlan({
  sha,
  email,
  paths = ON_VPS,
}: {
  sha: string
  email?: string
  paths?: VpsPaths
}): Step[] {
  if (!SHA.test(sha)) throw new Error(`"${sha}" is not a SHA.`)
  return [
    {
      name: 'Upload',
      upload: UPLOAD,
      script: 'rm -rf envio && mkdir -p envio',
    },
    { name: 'Image', script: buildImage(sha) },
    {
      name: 'GoatCounter',
      script: scriptOrFailure(() =>
        ensureStats({ email, passwordFile: paths.statsPassword }),
      ),
      onFailure: {
        warning: 'GoatCounter did not come up',
        // A GoatCounter live without a site shows the create-account screen
        // to whoever arrives.
        script: stopStatsWithoutSite(),
        warningIfFailsAgain:
          'could not check whether GoatCounter was left without a site.',
      },
    },
    { name: 'Swap', script: swapApp(sha, true, paths) },
  ]
}

/** Rolling back to an image the VPS kept. The vhost stays as it is. */
export function rollbackPlan({
  sha,
  paths = ON_VPS,
}: {
  sha: string
  paths?: VpsPaths
}): Step[] {
  if (!SHA.test(sha)) throw new Error(`"${sha}" is not a SHA.`)
  return [{ name: 'Swap', script: swapApp(sha, false, paths) }]
}
