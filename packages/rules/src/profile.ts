// O Perfil do visitante (GLOSSARY): o gênero dele, quem ele procura e a idade.
// Tudo opcional: quem não diz nada vê o Guia inteiro só com as notas "Vale
// para:". Os módulos do link (#34) e das calculadoras (#31, #33) leem daqui.

/** O gênero no Perfil. `outro` não existe no `cobre` das Fichas (#5). */
export const GENEROS_DO_PERFIL = ['homem', 'mulher', 'outro'] as const
export type GeneroDoPerfil = (typeof GENEROS_DO_PERFIL)[number]

/** Quem o visitante procura. `ambos` não existe no `cobre` das Fichas (#5). */
export const PROCURA_DO_PERFIL = ['homens', 'mulheres', 'ambos'] as const
export type ProcuraDoPerfil = (typeof PROCURA_DO_PERFIL)[number]

/** O site é para maiores de idade; acima de 120 é erro de digitação. */
export const IDADE_MINIMA = 18
export const IDADE_MAXIMA = 120

export interface Perfil {
  readonly genero?: GeneroDoPerfil
  readonly procura?: ProcuraDoPerfil
  readonly idade?: number
}

/** Sem gênero, sem quem procura e sem idade: é como não ter Perfil. */
export const perfilVazio = (perfil: Perfil | null): boolean =>
  !perfil ||
  (perfil.genero === undefined &&
    perfil.procura === undefined &&
    perfil.idade === undefined)

const umDe = <T extends string>(
  lista: ReadonlyArray<T>,
  valor: unknown,
): T | undefined => lista.find((item) => item === valor)

/** A idade como o Perfil aceita: inteira, de 18 a 120. Fora disso, `undefined`. */
export function idadeValida(valor: unknown): number | undefined {
  const numero =
    typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : valor
  return typeof numero === 'number' &&
    Number.isInteger(numero) &&
    numero >= IDADE_MINIMA &&
    numero <= IDADE_MAXIMA
    ? numero
    : undefined
}

/** Lê um Perfil de fonte não confiável (localStorage, query do link): fica só
 * o que é válido. Devolve `null` se nada sobrar. */
export function lerPerfil(valor: unknown): Perfil | null {
  if (typeof valor !== 'object' || valor === null) return null
  const bruto = valor as Record<string, unknown>
  const genero = umDe(GENEROS_DO_PERFIL, bruto.genero)
  const procura = umDe(PROCURA_DO_PERFIL, bruto.procura)
  const idade = idadeValida(bruto.idade)
  const perfil: Perfil = {
    ...(genero && { genero }),
    ...(procura && { procura }),
    ...(idade !== undefined && { idade }),
  }
  return perfilVazio(perfil) ? null : perfil
}

const GENERO_POR_EXTENSO: Record<GeneroDoPerfil, string> = {
  homem: 'homem',
  mulher: 'mulher',
  outro: 'outro gênero',
}

const PROCURA_POR_EXTENSO: Record<ProcuraDoPerfil, string> = {
  homens: 'procura homens',
  mulheres: 'procura mulheres',
  ambos: 'procura homens e mulheres',
}

/** "homem, procura homens, 30 anos": o Perfil em uma linha, para "Seu Perfil:
 * …" e para o aviso de que nenhum estudo cobre. */
export function descreverPerfil(perfil: Perfil): string {
  return [
    perfil.genero && GENERO_POR_EXTENSO[perfil.genero],
    perfil.procura && PROCURA_POR_EXTENSO[perfil.procura],
    perfil.idade !== undefined && `${perfil.idade} anos`,
  ]
    .filter(Boolean)
    .join(', ')
}
