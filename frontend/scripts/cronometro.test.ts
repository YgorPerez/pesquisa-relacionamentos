import { describe, expect, it } from 'vite-plus/test'
import { cronometro, duracao } from './cronometro.ts'

/** Um relógio que só anda quando o teste manda. */
function relogio() {
  let agora = 0
  return {
    agora: () => agora,
    andar: (ms: number) => {
      agora += ms
    },
  }
}

describe('duracao', () => {
  it('diz segundos com uma casa abaixo de um minuto', () => {
    expect(duracao(0)).toBe('0,0 s')
    expect(duracao(12_340)).toBe('12,3 s')
    expect(duracao(59_940)).toBe('59,9 s')
  })

  it('diz minutos e segundos de um minuto para cima', () => {
    expect(duracao(59_960)).toBe('1 min 0 s')
    expect(duracao(82_400)).toBe('1 min 22 s')
    expect(duracao(3_725_000)).toBe('62 min 5 s')
  })
})

describe('cronometro', () => {
  it('diz quanto cada etapa levou e o total', () => {
    const r = relogio()
    const linhas: string[] = []
    const c = cronometro((l) => linhas.push(l), r.agora)

    const valor = c.etapa('Envio', () => {
      r.andar(1_500)
      return 7
    })
    r.andar(500)
    c.etapa('Troca', () => r.andar(42_000))
    c.total()

    expect(valor).toBe(7)
    expect(linhas).toEqual([
      'Envio levou 1,5 s.',
      'Troca levou 42,0 s.',
      'Total: 44,0 s.',
    ])
  })

  it('a etapa que falha não diz tempo, e o erro segue', () => {
    const linhas: string[] = []
    const c = cronometro((l) => linhas.push(l), relogio().agora)

    expect(() =>
      c.etapa('Troca', () => {
        throw new Error('nginx -t recusou')
      }),
    ).toThrow('nginx -t recusou')
    expect(linhas).toEqual([])
  })

  it('espera a promessa da etapa antes de dizer o tempo', async () => {
    const r = relogio()
    const linhas: string[] = []
    const c = cronometro((l) => linhas.push(l), r.agora)

    const valor = await c.etapa('Conferência', async () => {
      await Promise.resolve()
      r.andar(3_000)
      return 'ok'
    })

    expect(valor).toBe('ok')
    expect(linhas).toEqual(['Conferência levou 3,0 s.'])
  })
})
