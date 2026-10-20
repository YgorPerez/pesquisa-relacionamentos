// O deploy contra uma VPS de mentira (`docker-de-mentira.ts`): o mesmo plano
// que vai pelo SSH, rodado num bash, sem Docker nem Nginx de verdade.
import { join } from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import { frontendDeMentira, vpsDeMentira } from './docker-de-mentira.ts'
import { publicar, voltar } from './vps.ts'

const SHA_1 = 'aaaaaaa'
const SHA_2 = 'bbbbbbb'
const SHA_3 = 'ccccccc'

/** O include que diz ao Nginx a porta do app. */
const proxyPara = (porta: number) => `proxy_pass http://127.0.0.1:${porta};\n`

function umaVps() {
  const vps = vpsDeMentira()
  const log: string[] = []
  const dizer = (linha: string) => log.push(linha)
  return {
    ...vps,
    log,
    publicar: (sha: string) =>
      publicar({
        saida: frontendDeMentira(sha),
        sha,
        vps: vps.vps,
        lugares: vps.lugares,
        dizer,
      }),
    voltar: (sha?: string) =>
      voltar({ sha, vps: vps.vps, lugares: vps.lugares, dizer }),
    /** O que está no ar: a porta do include, e a imagem e a porta do app. */
    noAr: () => ({
      include: vps.ler(vps.lugares.include),
      app: vps.conteiner('temestudo-app'),
    }),
  }
}

describe.skipIf(process.platform === 'win32')('o deploy na VPS', () => {
  it('o primeiro deploy sobe o app na primeira porta e instala o vhost', () => {
    const vps = umaVps()

    vps.publicar(SHA_1)

    expect(vps.noAr()).toEqual({
      include: proxyPara(3011),
      app: {
        imagem: `temestudo-app:sha-${SHA_1}`,
        porta: '3011',
        rodando: true,
      },
    })
    expect(vps.conteineres().sort()).toEqual([
      'temestudo-app',
      'temestudo-stats',
    ])
    expect(vps.ler(vps.lugares.vhost)).toBe(`temestudo.conf ${SHA_1}\n`)
    const { sitesEnabled } = vps.lugares
    expect(vps.ler(join(sitesEnabled, 'temestudo.conf'))).not.toBeNull()
    expect(vps.ler(join(sitesEnabled, 'default'))).toBeNull()
    expect(vps.ler(join(vps.lugares.pasta, 'no-ar'))).toBe(`${SHA_1}\n`)
    expect(vps.ler(join(vps.lugares.pasta, 'anterior'))).toBeNull()
  })

  it('o log diz quanto cada etapa levou, e o total', () => {
    const vps = umaVps()

    vps.publicar(SHA_1)

    const tempos = vps.log.filter((l) => /levou|Total/.test(l))
    expect(tempos.map((l) => l.replace(/[\d,]+ s/, 'N s'))).toEqual([
      'Envio levou N s.',
      'Imagem levou N s.',
      'GoatCounter levou N s.',
      'Troca levou N s.',
      'Total: N s.',
    ])
  })

  it('o deploy seguinte sobe na outra porta, recarrega o Nginx e para o antigo', () => {
    const vps = umaVps()
    vps.publicar(SHA_1)
    vps.chamadas()

    vps.publicar(SHA_2)

    expect(vps.noAr()).toEqual({
      include: proxyPara(3031),
      app: {
        imagem: `temestudo-app:sha-${SHA_2}`,
        porta: '3031',
        rodando: true,
      },
    })
    expect(vps.ler(join(vps.lugares.pasta, 'anterior'))).toBe(`${SHA_1}\n`)
    const chamadas = vps.chamadas()
    const reload = chamadas.indexOf('systemctl reload nginx')
    const stop = chamadas.indexOf('docker stop --timeout 30 temestudo-app')
    expect(reload).toBeGreaterThan(-1)
    // O antigo só para depois que o Nginx já passa ao novo.
    expect(stop).toBeGreaterThan(reload)
    expect(vps.ler(vps.lugares.vhost)).toBe(`temestudo.conf ${SHA_2}\n`)
  })

  it('o terceiro deploy volta à primeira porta e apaga as imagens de antes da anterior', () => {
    const vps = umaVps()
    vps.publicar(SHA_1)
    vps.publicar(SHA_2)

    vps.publicar(SHA_3)

    expect(vps.noAr().include).toBe(proxyPara(3011))
    expect(vps.imagens()).toEqual([
      'arp242/goatcounter:2.7.0',
      `temestudo-app:sha-${SHA_2}`,
      `temestudo-app:sha-${SHA_3}`,
    ])
  })

  it('voltar sem SHA troca para o deploy anterior, sem mexer no vhost', () => {
    const vps = umaVps()
    vps.publicar(SHA_1)
    vps.publicar(SHA_2)

    vps.voltar()

    expect(vps.noAr()).toEqual({
      include: proxyPara(3011),
      app: {
        imagem: `temestudo-app:sha-${SHA_1}`,
        porta: '3011',
        rodando: true,
      },
    })
    expect(vps.ler(vps.lugares.vhost)).toBe(`temestudo.conf ${SHA_2}\n`)
    expect(vps.ler(join(vps.lugares.pasta, 'anterior'))).toBe(`${SHA_2}\n`)
    expect(vps.log).toContain(`Voltando para sha-${SHA_1}.`)
  })

  it('voltar a um SHA que a VPS não guardou não mexe no que está no ar', () => {
    const vps = umaVps()
    vps.publicar(SHA_1)
    const antes = vps.noAr()

    expect(() => vps.voltar('deadbee')).toThrow(
      'A VPS não tem a imagem temestudo-app:sha-deadbee.',
    )
    expect(vps.noAr()).toEqual(antes)
  })

  it('voltar sem deploy anterior pede o SHA', () => {
    const vps = umaVps()
    vps.publicar(SHA_1)

    expect(() => vps.voltar()).toThrow('diga o SHA')
  })

  it('o contêiner novo que não responde sai, e o antigo segue no ar', () => {
    const vps = umaVps()
    vps.publicar(SHA_1)
    const antes = vps.noAr()
    vps.chamadas()
    vps.estragar('app-nao-responde')

    expect(() => vps.publicar(SHA_2)).toThrow(
      /O app novo não respondeu em \/ na porta 3031.*o log de temestudo-app-novo/s,
    )
    expect(vps.noAr()).toEqual(antes)
    expect(vps.conteineres()).not.toContain('temestudo-app-novo')
    expect(vps.chamadas()).not.toContain('systemctl reload nginx')
    expect(vps.ler(vps.lugares.vhost)).toBe(`temestudo.conf ${SHA_1}\n`)
  })

  it('o nginx -t que recusa desfaz a configuração nova, e o antigo segue no ar', () => {
    const vps = umaVps()
    vps.publicar(SHA_1)
    const antes = vps.noAr()
    vps.chamadas()
    vps.estragar('nginx-recusa')

    expect(() => vps.publicar(SHA_2)).toThrow(
      /unknown directive.*O nginx -t recusou a configuração nova/s,
    )
    expect(vps.noAr()).toEqual(antes)
    expect(vps.conteineres()).not.toContain('temestudo-app-novo')
    expect(vps.chamadas()).not.toContain('systemctl reload nginx')
    for (const [nome, destino] of vps.lugares.configuracao)
      expect(vps.ler(destino)).toBe(`${nome} ${SHA_1}\n`)
  })

  it('o nginx -t que recusa o primeiro deploy não deixa vhost nenhum', () => {
    const vps = umaVps()
    vps.estragar('nginx-recusa')

    expect(() => vps.publicar(SHA_1)).toThrow(/nginx -t recusou/)
    expect(vps.noAr()).toEqual({ include: null, app: null })
    for (const [, destino] of vps.lugares.configuracao)
      expect(vps.ler(destino)).toBeNull()
    expect(vps.ler(join(vps.lugares.sitesEnabled, 'temestudo.conf'))).toBeNull()
  })
})

describe.skipIf(process.platform === 'win32')('o GoatCounter no deploy', () => {
  it('o primeiro deploy cria o site, guarda a senha e aplica a coleta', () => {
    const vps = umaVps()

    vps.publicar(SHA_1)

    expect(vps.conteiner('temestudo-stats')).toEqual({
      imagem: 'arp242/goatcounter:2.7.0',
      porta: '3051',
      rodando: true,
    })
    expect(vps.ler(vps.lugares.senhaDoStats)).toMatch(/^[A-Za-z0-9]{40}\n$/)
    expect(vps.statsConfigurado()).toBe(true)
    expect(vps.log.join('\n')).toContain(
      `GoatCounter: site stats.temestudo.cloud criado, login admin@temestudo.cloud, senha em ${vps.lugares.senhaDoStats}.`,
    )
  })

  it('com ele no ar e configurado, o deploy não o troca', () => {
    const vps = umaVps()
    vps.publicar(SHA_1)
    const senha = vps.ler(vps.lugares.senhaDoStats)
    vps.chamadas()

    vps.publicar(SHA_2)

    const chamadas = vps.chamadas()
    expect(chamadas.some((c) => c.startsWith('docker pull'))).toBe(false)
    expect(chamadas.some((c) => c.startsWith('docker restart'))).toBe(false)
    expect(vps.ler(vps.lugares.senhaDoStats)).toBe(senha)
    expect(vps.log.join('\n')).toContain(
      'GoatCounter arp242/goatcounter:2.7.0 já no ar na porta 3051.',
    )
  })

  it('se o site não se cria, ele fica parado, sem senha, e o site sobe mesmo assim', () => {
    const vps = umaVps()
    vps.estragar('falha-ao-criar-site')

    vps.publicar(SHA_1)

    expect(vps.conteiner('temestudo-stats')?.rodando).toBe(false)
    expect(vps.ler(vps.lugares.senhaDoStats)).toBeNull()
    expect(vps.noAr().app?.rodando).toBe(true)
    expect(
      vps.log.some((l) =>
        l.startsWith(
          'Aviso: o GoatCounter não subiu (o script saiu com 1: Não deu para criar o site',
        ),
      ),
    ).toBe(true)
  })

  it('um e-mail que o deploy recusa vira aviso, e o site sobe', () => {
    const vps = umaVps()

    publicar({
      saida: frontendDeMentira(SHA_1),
      sha: SHA_1,
      email: "a@b.com'; rm -rf /",
      vps: vps.vps,
      lugares: vps.lugares,
      dizer: (l) => vps.log.push(l),
    })

    expect(vps.noAr().app?.rodando).toBe(true)
    expect(vps.conteineres()).not.toContain('temestudo-stats')
    expect(vps.log.join('\n')).toContain(
      `Aviso: o GoatCounter não subiu (o script saiu com 1: "a@b.com'; rm -rf /" não é um e-mail que o deploy aceite.). O site segue.`,
    )
  })
})
