// O Nginx do host conferido pelo formato declarado (spec #23, Testing seam 4;
// ADR 0001): o access_log nunca leva a query, o error_log é o do site e gira
// todo dia guardando 3, e toda resposta leva `Referrer-Policy: strict-origin`.

import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vite-plus/test'
import { CONFIGURACAO_DO_HOST, STATS } from '../scripts/vps.ts'

const pasta = new URL('./', import.meta.url)
const vhost = readFileSync(new URL('temestudo.conf', pasta), 'utf8')
const formatoDoLog = readFileSync(new URL('log-sem-query.conf', pasta), 'utf8')
const rotacao = readFileSync(new URL('logrotate-temestudo', pasta), 'utf8')

type Diretiva = { nome: string; args: string[]; filhos?: Diretiva[] }

/** O bastante da gramática do Nginx para o vhost: diretivas `nome args;`,
 * blocos `nome args { … }`, comentários `#` e aspas simples ou duplas. */
function ler(texto: string): Diretiva[] {
  const tokens =
    texto.match(/'[^']*'|"[^"]*"|#[^\n]*|[{};]|[^\s{};'"#]+/g) ?? []
  let i = 0
  const bloco = (): Diretiva[] => {
    const diretivas: Diretiva[] = []
    let atual: string[] = []
    while (i < tokens.length) {
      const t = tokens[i++]
      if (t.startsWith('#')) continue
      if (t === ';') {
        diretivas.push({ nome: atual[0], args: atual.slice(1) })
        atual = []
      } else if (t === '{') {
        diretivas.push({
          nome: atual[0],
          args: atual.slice(1),
          filhos: bloco(),
        })
        atual = []
      } else if (t === '}') return diretivas
      else atual.push(t.replace(/^(['"])(.*)\1$/s, '$2'))
    }
    return diretivas
  }
  return bloco()
}

const topo = ler(vhost)
const doLog = ler(formatoDoLog)
const servidores = topo.filter((d) => d.nome === 'server')
const de = (bloco: Diretiva[] | undefined, nome: string) =>
  (bloco ?? []).filter((d) => d.nome === nome)

/** Todo bloco que declara um `add_header` some com os de fora dele: no
 * Nginx, um `add_header` dentro de `location` apaga os do `server`. */
function blocosComCabecalhos(bloco: Diretiva[]): Diretiva[][] {
  return bloco.flatMap((d) =>
    d.filhos ? [d.filhos, ...blocosComCabecalhos(d.filhos)] : [],
  )
}

// Tudo que copia a query, ou o endereço inteiro de onde o visitante veio.
const VARIAVEIS_COM_QUERY =
  /\$(request|request_uri|args|query_string|is_args|arg_\w+|http_referer|request_body|uri_with_args)\b/

describe('o formato do access_log', () => {
  test('é um log_format só, que não leva a query nem o Referer', () => {
    const formatos = de(doLog, 'log_format')
    expect(formatos.map((f) => f.args[0])).toEqual(['temestudo_sem_query'])
    const formato = formatos[0].args.slice(1).join(' ')
    expect(formato).toContain('$request_method')
    expect(formato).toContain('$status')
    expect(formato).toContain('$request_time')
    expect(formato).toContain('$temestudo_caminho')
    expect(formato).not.toMatch(VARIAVEIS_COM_QUERY)
  })

  test('o caminho do log é o pedido cortado antes do primeiro ?', () => {
    const [mapa] = de(doLog, 'map')
    expect(mapa.args).toEqual(['$request_uri', '$temestudo_caminho'])
    const [regra] = (mapa.filhos ?? []).filter((d) => d.nome.startsWith('~'))
    const regex = new RegExp(regra.nome.slice(1))
    const captura = regra.args[0].slice(1)
    const caminho = (uri: string) => uri.match(regex)?.groups?.[captura]
    expect(caminho('/grupo-possivel?v=1&g=h&p=m')).toBe('/grupo-possivel')
    expect(caminho('/?g=mulher%20trans')).toBe('/')
    expect(caminho('/guias/onde-conhecer')).toBe('/guias/onde-conhecer')
  })
})

describe('o vhost de temestudo.com', () => {
  test('não declara outro log_format: todos vêm do log-sem-query.conf', () => {
    expect(de(topo, 'log_format')).toEqual([])
  })

  test('cada server grava o access_log no formato sem query e o error_log do site', () => {
    expect(servidores.length).toBeGreaterThanOrEqual(3)
    for (const servidor of servidores) {
      expect(de(servidor.filhos, 'access_log').map((d) => d.args)).toEqual([
        ['/var/log/nginx/temestudo/access.log', 'temestudo_sem_query'],
      ])
      expect(de(servidor.filhos, 'error_log').map((d) => d.args[0])).toEqual([
        '/var/log/nginx/temestudo/error.log',
      ])
    }
  })

  test('nenhum access_log, em bloco nenhum, usa outro formato', () => {
    const todos = (bloco: Diretiva[]): Diretiva[] =>
      bloco.flatMap((d) => [d, ...(d.filhos ? todos(d.filhos) : [])])
    for (const d of todos(topo).filter((d) => d.nome === 'access_log')) {
      expect(d.args[1]).toBe('temestudo_sem_query')
    }
  })

  test('um pedido a outro host ou ao IP cai num default_server com o mesmo log', () => {
    const padroes = servidores.filter((s) =>
      de(s.filhos, 'listen').some((l) => l.args.includes('default_server')),
    )
    const portas = padroes.flatMap((s) =>
      de(s.filhos, 'listen').map((l) => l.args[0]),
    )
    expect(portas).toEqual(expect.arrayContaining(['80', '443']))
  })

  test('todo bloco que escreve cabeçalhos manda Referrer-Policy: strict-origin', () => {
    const https = servidores.filter(
      (s) =>
        de(s.filhos, 'server_name').some((n) =>
          n.args.includes('temestudo.com'),
        ) && de(s.filhos, 'listen').some((l) => l.args.includes('ssl')),
    )
    expect(https).toHaveLength(1)
    const blocos = blocosComCabecalhos(https)
    const comCabecalho = blocos.filter((b) => de(b, 'add_header').length > 0)
    expect(comCabecalho.length).toBeGreaterThan(0)
    expect(de(https[0].filhos, 'add_header').length).toBeGreaterThan(0)
    for (const bloco of comCabecalho) {
      expect(de(bloco, 'add_header').map((d) => d.args)).toContainEqual([
        'Referrer-Policy',
        'strict-origin',
        'always',
      ])
    }
  })

  test('o proxy para o contêiner sai do include que o deploy escreve', () => {
    expect(vhost).toContain('include /etc/nginx/temestudo/temestudo-app.conf;')
  })
})

describe('o vhost de stats.temestudo.com (GoatCounter, #35)', () => {
  const stats = ler(
    readFileSync(new URL('temestudo-stats.conf', pasta), 'utf8'),
  )
  const blocos = stats.filter((d) => d.nome === 'server')
  const todos = (bloco: Diretiva[]): Diretiva[] =>
    bloco.flatMap((d) => [d, ...(d.filhos ? todos(d.filhos) : [])])

  test('só atende stats.temestudo.com, no 80 e no 443', () => {
    expect(
      blocos.map((s) => de(s.filhos, 'server_name').flatMap((n) => n.args)),
    ).toEqual([['stats.temestudo.com'], ['stats.temestudo.com']])
    expect(de(stats, 'log_format')).toEqual([])
  })

  test('cada server grava no formato sem query e no error_log do site', () => {
    for (const servidor of blocos) {
      expect(de(servidor.filhos, 'access_log').map((d) => d.args)).toEqual([
        ['/var/log/nginx/temestudo/access.log', 'temestudo_sem_query'],
      ])
      expect(de(servidor.filhos, 'error_log').map((d) => d.args[0])).toEqual([
        '/var/log/nginx/temestudo/error.log',
      ])
    }
    for (const d of todos(stats).filter((d) => d.nome === 'access_log')) {
      expect(d.args[1]).toBe('temestudo_sem_query')
    }
  })

  test('o 80 serve o desafio do certbot e manda o resto para o https', () => {
    const http = blocos.find((s) =>
      de(s.filhos, 'listen').some((l) => l.args[0] === '80'),
    )
    const locais = de(http?.filhos, 'location')
    expect(locais.map((l) => l.args)).toContainEqual([
      '^~',
      '/.well-known/acme-challenge/',
    ])
    const acme = locais.find((l) =>
      l.args.includes('/.well-known/acme-challenge/'),
    )
    expect(de(acme?.filhos, 'root').map((d) => d.args)).toEqual([
      ['/opt/temestudo/acme'],
    ])
  })

  test('o 443 passa ao contêiner do GoatCounter em 127.0.0.1, com o IP de quem visita', () => {
    const https = blocos.find((s) =>
      de(s.filhos, 'listen').some((l) => l.args.includes('ssl')),
    )
    expect(de(https?.filhos, 'include').map((d) => d.args[0])).toContain(
      '/etc/nginx/temestudo/tls.conf',
    )
    const proxy = todos(https?.filhos ?? []).filter(
      (d) => d.nome === 'proxy_pass',
    )
    expect(proxy.map((d) => d.args[0])).toEqual([
      `http://127.0.0.1:${STATS.porta}`,
    ])
    const cabecalhos = todos(https?.filhos ?? []).filter(
      (d) => d.nome === 'proxy_set_header',
    )
    expect(cabecalhos.map((d) => d.args)).toContainEqual([
      'X-Forwarded-For',
      '$remote_addr',
    ])
    expect(de(https?.filhos, 'add_header').map((d) => d.args)).toContainEqual([
      'Referrer-Policy',
      'strict-origin',
      'always',
    ])
  })

  test('o deploy instala o arquivo e o liga', () => {
    expect(CONFIGURACAO_DO_HOST).toContainEqual([
      'temestudo-stats.conf',
      STATS.vhost,
    ])
  })
})

describe('a rotação dos logs do site', () => {
  const estrofes = [...rotacao.matchAll(/^([^\s#][^{]*)\{([^}]*)\}/gm)].map(
    (m) => ({
      arquivos: m[1].trim().split(/\s+/),
      regras: m[2]
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#')),
    }),
  )

  test('o error_log gira todo dia e não passa de 3 dias, contando o arquivo atual', () => {
    const erro = estrofes.find((e) =>
      e.arquivos.includes('/var/log/nginx/temestudo/error.log'),
    )
    expect(erro?.regras).toContain('daily')
    const rotate = Number(
      erro?.regras.find((r) => r.startsWith('rotate '))?.split(' ')[1],
    )
    // O `error.log` de hoje mais `rotate` arquivos girados, um por dia.
    expect(1 + rotate).toBe(3)
    expect(erro?.regras.some((r) => r.startsWith('postrotate'))).toBe(true)
  })
})
