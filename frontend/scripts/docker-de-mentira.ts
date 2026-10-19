// Uma VPS de mentira para o `vps.test.ts`, no molde do Festival dos Macacos
// (`docker-de-mentira.ts` de lá): os scripts do plano rodam num bash de
// verdade, numa pasta temporária que faz o papel de `/`, e o `docker`, o
// `curl`, o `nginx`, o `systemctl`, o `pgrep` e o `sleep` do `PATH` são de
// mentira. O `docker` lembra, em arquivos, as imagens, os contêineres (a
// imagem, a porta e se pararam) e o site do GoatCounter. Cada chamada fica
// em `chamadas`, em ordem.

import { spawnSync } from 'node:child_process'
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  CONFIGURACAO_DO_HOST,
  lugaresNaVps,
  prologo,
} from './plano-do-deploy.ts'
import type { Vps } from './vps.ts'

const DOCKER = String.raw`#!/usr/bin/env bash
E="$ESTADO"; C="$E/c"
echo "docker $*" >> "$E/chamadas"
ULTIMO="${'$'}{!#}"
case "$1" in
  image) grep -qxF "$3" "$E/imagens" ;;
  images)
    # Da mais nova para a mais velha, como o docker.
    awk '{ l[NR] = $0 } END { for (i = NR; i > 0; i--) print l[i] }' "$E/imagens" | while IFS=: read -r REPO TAG; do
      if [ "$REPO" = "$2" ]; then echo "$TAG"; fi
    done ;;
  rmi)
    grep -vxF "$2" "$E/imagens" > "$E/imagens.novo" || true
    mv "$E/imagens.novo" "$E/imagens" ;;
  build)
    while [ $# -gt 0 ]; do
      if [ "$1" = -t ]; then echo "$2" >> "$E/imagens"; fi
      shift
    done ;;
  pull) grep -qxF "$3" "$E/imagens" || echo "$3" >> "$E/imagens" ;;
  volume) ;;
  run)
    shift; NOME=; PORTA=; IMAGEM=
    while [ $# -gt 0 ]; do
      case "$1" in
        --name) NOME=$2; shift 2 ;;
        -p) PORTA=$(echo "$2" | cut -d: -f2); shift 2 ;;
        --restart|--tmpfs|--cap-drop|--security-opt|--log-opt|-v) shift 2 ;;
        -*) shift ;;
        *) IMAGEM=$1; break ;;
      esac
    done
    grep -qxF "$IMAGEM" "$E/imagens" || { echo "Unable to find image $IMAGEM" >&2; exit 125; }
    [ ! -f "$C/$NOME" ] || { echo "Conflict: $NOME já existe" >&2; exit 125; }
    echo "$IMAGEM" > "$C/$NOME"; echo "$PORTA" > "$C/$NOME.porta" ;;
  rm)
    [ -f "$C/$ULTIMO" ] || { echo "No such container: $ULTIMO" >&2; exit 1; }
    rm -f "$C/$ULTIMO" "$C/$ULTIMO.porta" "$C/$ULTIMO.parado" ;;
  stop) [ -f "$C/$ULTIMO" ] && touch "$C/$ULTIMO.parado" ;;
  restart) rm -f "$C/$ULTIMO.parado" ;;
  rename)
    for EXT in "" .porta .parado; do
      if [ -f "$C/$2$EXT" ]; then mv "$C/$2$EXT" "$C/$3$EXT"; fi
    done ;;
  logs) echo "o log de $ULTIMO" ;;
  inspect)
    [ -f "$C/$ULTIMO" ] || exit 1
    case "$*" in
      *Config.Image*) cat "$C/$ULTIMO" ;;
      *State.Running*) if [ -f "$C/$ULTIMO.parado" ]; then echo false; else echo true; fi ;;
    esac ;;
  exec)
    [ -f "$C/$2" ] && [ ! -f "$C/$2.parado" ] || exit 1
    case "$5 $6" in
      "show site") [ -f "$E/site" ] ;;
      "create site") [ ! -f "$E/falha-ao-criar-site" ] && touch "$E/site" ;;
      "query select"*)
        echo "?column?"
        if [ -f "$E/configurado" ]; then echo "26,31"; else echo "0,0"; fi ;;
      "query update"*) touch "$E/configurado" ;;
    esac ;;
esac
`

/** O `curl` do script: o do GoatCounter (`-w`) diz 200, o do app passa se
 * algum contêiner que responde está na porta pedida. */
const CURL = String.raw`#!/usr/bin/env bash
echo "curl $*" >> "$ESTADO/chamadas"
for A in "$@"; do
  if [ "$A" = -w ]; then echo 200; exit 0; fi
done
PORTA=$(echo "${'$'}{!#}" | sed -E 's|.*:([0-9]+)/.*|\1|')
[ ! -f "$ESTADO/app-nao-responde" ] || exit 7
for P in "$ESTADO"/c/*.porta; do
  if [ -f "$P" ] && [ "$(cat "$P")" = "$PORTA" ]; then exit 0; fi
done
exit 7
`

const NGINX = String.raw`#!/usr/bin/env bash
echo "nginx $*" >> "$ESTADO/chamadas"
if [ -f "$ESTADO/nginx-recusa" ]; then
  echo "nginx: [emerg] unknown directive \"proxy_pas\"" >&2; exit 1
fi
`

/** Só registra a chamada e sai bem. */
const REGISTRA = String.raw`#!/usr/bin/env bash
echo "$(basename "$0") $*" >> "$ESTADO/chamadas"
`

/** O `install -o root -g root` de quem não é root: tira o dono e instala. */
const INSTALL = String.raw`#!/usr/bin/env bash
ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    -o|-g) shift 2 ;;
    *) ARGS+=("$1"); shift ;;
  esac
done
exec /usr/bin/install "${'$'}{ARGS[@]}"
`

/** O que a VPS tem, ou passa a ter, antes do próximo script. */
type Avaria = 'app-nao-responde' | 'nginx-recusa' | 'falha-ao-criar-site'

/** Uma VPS nova e vazia, com o Nginx de pé e nada do site. */
export function vpsDeMentira() {
  const raiz = mkdtempSync(join(tmpdir(), 'vps-de-mentira-'))
  const estado = join(raiz, 'docker')
  const bin = join(raiz, 'bin')
  const lugares = lugaresNaVps(raiz)
  // As pastas que o Nginx e o logrotate do Ubuntu já trazem.
  const doSistema = [
    'etc/nginx/conf.d',
    'etc/nginx/sites-available',
    'etc/logrotate.d',
  ]
  for (const pasta of [
    join(estado, 'c'),
    bin,
    lugares.sitesEnabled,
    ...doSistema.map((p) => join(raiz, p)),
  ])
    mkdirSync(pasta, { recursive: true })
  writeFileSync(join(estado, 'imagens'), '')
  writeFileSync(join(estado, 'chamadas'), '')
  mkdirSync(join(raiz, 'run'))
  writeFileSync(lugares.pidDoNginx, '1\n')
  mkdirSync(join(raiz, 'tmp'))
  // O site padrão que o pacote do Nginx instala.
  writeFileSync(join(lugares.sitesEnabled, 'default'), '')
  const programas = {
    docker: DOCKER,
    curl: CURL,
    nginx: NGINX,
    systemctl: REGISTRA,
    pgrep: '#!/usr/bin/env bash\nexit 1\n',
    sleep: '#!/usr/bin/env bash\n',
    install: INSTALL,
  }
  for (const [nome, texto] of Object.entries(programas)) {
    writeFileSync(join(bin, nome), texto)
    chmodSync(join(bin, nome), 0o755)
  }

  const vps: Vps = {
    rodar(script) {
      const r = spawnSync('bash', ['-s'], {
        cwd: raiz,
        input: `${prologo(lugares)}${script}`,
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          ESTADO: estado,
        },
      })
      if (r.status !== 0)
        throw new Error(`o script saiu com ${r.status}: ${r.stderr.trim()}`)
      return r.stdout
    },
    enviar(pasta, nomes) {
      for (const nome of nomes)
        copyFileSync(join(pasta, nome), join(lugares.pasta, 'envio', nome))
    },
  }

  const ler = (caminho: string) =>
    existsSync(caminho) ? readFileSync(caminho, 'utf8') : null
  const conteiner = (nome: string) => {
    const base = join(estado, 'c', nome)
    if (!existsSync(base)) return null
    return {
      imagem: readFileSync(base, 'utf8').trim(),
      porta: readFileSync(`${base}.porta`, 'utf8').trim(),
      rodando: !existsSync(`${base}.parado`),
    }
  }

  return {
    vps,
    lugares,
    ler,
    conteiner,
    conteineres: () =>
      readdirSync(join(estado, 'c')).filter((n) => !n.includes('.')),
    imagens: () =>
      readFileSync(join(estado, 'imagens'), 'utf8')
        .trim()
        .split('\n')
        .filter(Boolean),
    /** As chamadas aos programas de mentira desde a última vez que se leu. */
    chamadas() {
      const arquivo = join(estado, 'chamadas')
      const linhas = readFileSync(arquivo, 'utf8')
        .trim()
        .split('\n')
        .filter(Boolean)
      writeFileSync(arquivo, '')
      return linhas
    },
    estragar(avaria: Avaria) {
      writeFileSync(join(estado, avaria), '')
    },
    consertar(avaria: Avaria) {
      rmSync(join(estado, avaria), { force: true })
    },
    /** O GoatCounter já com a coleta e a retenção combinadas. */
    statsConfigurado: () => existsSync(join(estado, 'configurado')),
  }
}

/** Um `frontend/` com um `.output`, o `Dockerfile` e o `nginx/`, como o
 * `publicar` espera. A versão vai dentro de cada arquivo da configuração. */
export function frontendDeMentira(versao: string) {
  const frontend = mkdtempSync(join(tmpdir(), 'frontend-de-mentira-'))
  mkdirSync(join(frontend, '.output', 'server'), { recursive: true })
  writeFileSync(join(frontend, '.output', 'server', 'index.mjs'), versao)
  writeFileSync(join(frontend, 'Dockerfile'), 'FROM node:24-alpine\n')
  mkdirSync(join(frontend, 'nginx'))
  for (const [nome] of CONFIGURACAO_DO_HOST)
    writeFileSync(join(frontend, 'nginx', nome), `${nome} ${versao}\n`)
  return join(frontend, '.output')
}
