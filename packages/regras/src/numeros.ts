// Os números do Grupo possível escritos para gente: 2 algarismos, sem falsa
// precisão (#8, story 43). Servem à página, ao cartão do B5 (#32) e à prévia
// do link (#34).

type Modo = 'perto' | 'baixo' | 'cima'

const ARREDONDAR: Record<Modo, (x: number) => number> = { perto: Math.round, baixo: Math.floor, cima: Math.ceil }

/** Arredonda a 2 algarismos significativos (abaixo de 100, à unidade). */
export function arredondar2(x: number, modo: Modo = 'perto'): number {
  if (x < 100) return ARREDONDAR[modo](x)
  const passo = 10 ** (Math.floor(Math.log10(x)) - 1)
  return ARREDONDAR[modo](x / passo) * passo
}

const decimal = (x: number) => x.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

function escrever(v: number): string {
  if (v < 1000) return String(v)
  if (v < 1e6) return `${decimal(v / 1e3)} mil`
  const m = v / 1e6
  return `${decimal(m)} ${m < 2 ? 'milhão' : 'milhões'}`
}

/** "750 mil", "1,5 milhão". Abaixo de uma pessoa, "menos de 1"; zero é "ninguém". */
export function formatarQuantidade(x: number): string {
  if (x <= 0) return 'ninguém'
  if (x < 1) return 'menos de 1'
  return escrever(arredondar2(x))
}

/** "entre 160 mil e 200 mil": a faixa sempre contém o intervalo da conta. */
export function formatarFaixa(min: number, max: number): string {
  const de = arredondar2(Math.max(0, min), 'baixo')
  const ate = arredondar2(Math.max(0, max), 'cima')
  return de === ate ? `cerca de ${escrever(de)}` : `entre ${escrever(de)} e ${escrever(ate)}`
}

/** "×3,4", "×13". */
export function formatarVezes(vezes: number): string {
  if (!Number.isFinite(vezes)) return 'de ninguém para alguém'
  return vezes >= 10 ? `×${Math.round(vezes)}` : `×${decimal(Math.round(vezes * 10) / 10)}`
}

/** "+670", "+48 mil". */
export const formatarGanho = (ganho: number): string => `+${ganho < 1 ? '0' : escrever(arredondar2(ganho))}`
