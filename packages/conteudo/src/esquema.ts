// O frontmatter da Ficha (#10, #5, #16), em Effect Schema. O validador do
// build e o app leem o mesmo esquema; as listas fechadas vêm de `listas.ts`.
import { Schema } from 'effect'
import { CASAIS, DESENHOS, FORCAS, GENEROS, PROCURA, STATUS } from './listas.ts'

const Texto = Schema.String.check(Schema.isMinLength(1, { message: 'não pode ficar vazio' }))

const Data = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { message: 'use a data como AAAA-MM-DD' }),
)

const Url = Schema.String.check(
  Schema.isPattern(/^https?:\/\/\S+$/, { message: 'precisa ser uma URL começando com http' }),
)

/** Slug de arquivo: minúsculas, sem acento, com hífen (#15). */
export const Slug = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'use minúsculas sem acento, com hífen entre as palavras',
  }),
)

const Idade = Schema.Int.check(
  Schema.isBetween({ minimum: 0, maximum: 120 }, { message: 'idade entre 0 e 120' }),
)

/** Quem a amostra cobre. Chave ausente quer dizer que o estudo não separou. */
export const Cobre = Schema.Struct({
  generos: Schema.optional(Schema.Array(Schema.Literals(GENEROS))),
  procura: Schema.optional(Schema.Array(Schema.Literals(PROCURA))),
  idades: Schema.optional(Schema.Struct({ min: Idade, max: Idade })),
  casal: Schema.optional(Schema.Literals(CASAIS)),
})
export type Cobre = typeof Cobre.Type

/** Título e descrição de busca no lugar dos derivados (#15). */
export const Seo = Schema.Struct({
  titulo: Schema.optional(Texto),
  descricao: Schema.optional(Texto),
})
export type Seo = typeof Seo.Type

/** A origem de um arquivo de dados das calculadoras (`dados/**\/x.meta.yaml`, #10). */
export const MetaDados = Schema.Struct({
  ficha: Slug,
  tabela: Schema.optional(Schema.Array(Texto)),
  variaveis: Schema.optional(Schema.Array(Texto)),
  baixado_em: Data,
  script: Texto,
  versao: Texto,
  /** O que o pipeline conferiu contra números publicados. */
  conferencia: Schema.optional(Texto),
})
export type MetaDados = typeof MetaDados.Type

export const FrontmatterFicha = Schema.Struct({
  referencia: Texto,
  link: Url,
  status: Schema.Literals(STATUS),
  verificado_em: Schema.optional(Data),
  forca: Schema.Literals(FORCAS),
  forca_porque: Texto,
  paises: Schema.Array(Texto),
  periodo: Texto,
  amostra: Schema.Struct({
    n: Schema.optional(Schema.Int.check(Schema.isGreaterThan(0))),
    descricao: Texto,
    representativa: Schema.Boolean,
  }),
  desenho: Schema.Literals(DESENHOS),
  conflito: Schema.optional(Texto),
  licenca: Schema.optional(Texto),
  cobre: Cobre,
  antes: Schema.optional(Schema.Array(Slug)),
  seo: Schema.optional(Seo),
})
export type FrontmatterFicha = typeof FrontmatterFicha.Type
