// The fact sheet frontmatter (#10, #5, #16), in Effect Schema. The build
// validator and the app read the same schema; the closed lists come from
// `lists.ts`. Keys and values stay in Portuguese: they are the content
// contract, which #70 translates.
import { Schema } from 'effect'
import {
  CALCULATORS,
  COUPLES,
  DESIGNS,
  STRENGTHS,
  GENDERS,
  SEEKS,
  VERIFICATION_STATUSES,
} from './lists.ts'

const Text = Schema.String.check(
  Schema.isMinLength(1, { message: 'cannot be empty' }),
)

const DateText = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'write the date as YYYY-MM-DD',
  }),
)

const Url = Schema.String.check(
  Schema.isPattern(/^https?:\/\/\S+$/, {
    message: 'must be a URL starting with http',
  }),
)

/** File slug: lowercase, no accents, hyphenated (#15). */
export const Slug = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'use lowercase without accents, with hyphens between words',
  }),
)

const Age = Schema.Int.check(
  Schema.isBetween(
    { minimum: 0, maximum: 120 },
    { message: 'age between 0 and 120' },
  ),
)

/** Who the sample covers. A missing key means the study did not split by it. */
export const Coverage = Schema.Struct({
  generos: Schema.optional(Schema.Array(Schema.Literals(GENDERS))),
  procura: Schema.optional(Schema.Array(Schema.Literals(SEEKS))),
  idades: Schema.optional(Schema.Struct({ min: Age, max: Age })),
  casal: Schema.optional(Schema.Literals(COUPLES)),
})
export type Coverage = typeof Coverage.Type

/** Search title and description in place of the derived ones (#15). */
export const Seo = Schema.Struct({
  titulo: Schema.optional(Text),
  descricao: Schema.optional(Text),
})
export type Seo = typeof Seo.Type

/** Where a calculator data file comes from (`dados/**\/x.meta.yaml`, #10). */
export const DataMeta = Schema.Struct({
  ficha: Slug,
  tabela: Schema.optional(Schema.Array(Text)),
  variaveis: Schema.optional(Schema.Array(Text)),
  baixado_em: DateText,
  script: Text,
  versao: Text,
  /** What the pipeline checked against published numbers. */
  conferencia: Schema.optional(Text),
})
export type DataMeta = typeof DataMeta.Type

export const FactSheetFrontmatter = Schema.Struct({
  referencia: Text,
  link: Url,
  status: Schema.Literals(VERIFICATION_STATUSES),
  verificado_em: Schema.optional(DateText),
  forca: Schema.Literals(STRENGTHS),
  forca_porque: Text,
  paises: Schema.Array(Text),
  periodo: Text,
  amostra: Schema.Struct({
    n: Schema.optional(Schema.Int.check(Schema.isGreaterThan(0))),
    descricao: Text,
    representativa: Schema.Boolean,
  }),
  desenho: Schema.Literals(DESIGNS),
  conflito: Schema.optional(Text),
  licenca: Schema.optional(Text),
  cobre: Coverage,
  antes: Schema.optional(Schema.Array(Slug)),
  seo: Schema.optional(Seo),
})
export type FactSheetFrontmatter = typeof FactSheetFrontmatter.Type

const Slugs = Schema.Array(Slug)

/** `guias/<topic>/_tema.md`: the body is the context paragraph. */
export const TopicFrontmatter = Schema.Struct({
  titulo: Text,
  ordem: Slugs,
  antes: Schema.optional(Slugs),
  seo: Schema.optional(Seo),
})
export type TopicFrontmatter = typeof TopicFrontmatter.Type

/** `dicas/<slug>.md`: the body is the tip text. */
export const TipFrontmatter = Schema.Struct({
  fichas: Slugs,
  forca: Schema.Literals(STRENGTHS),
  inferencia: Schema.optional(Schema.Boolean),
  vale_para: Schema.optional(Coverage),
  antes: Schema.optional(Slugs),
  seo: Schema.optional(Seo),
})
export type TipFrontmatter = typeof TipFrontmatter.Type

export const GuideFinding = Schema.Struct({
  texto: Text,
  fichas: Slugs,
  pais: Schema.optional(Text),
  periodo: Schema.optional(Text),
  vale_para: Schema.optional(Coverage),
})

const Side = Schema.Struct({ titulo: Text, texto: Text, fichas: Slugs })

/** The evidence diverges: both sides in a table and which one has the better
 * design (#7). */
export const Divergence = Schema.Struct({
  melhor_desenho: Text,
  lados: Schema.Tuple([Side, Side]),
})
export type Divergence = typeof Divergence.Type

export const Myth = Schema.Struct({
  afirmacao: Text,
  por_que_nao: Text,
  fichas: Slugs,
})
export type Myth = typeof Myth.Type

/** A guide's `antes`: the old slug in the same topic, or `topic/slug` when the
 * guide came from another topic. */
const GuidePath = Schema.String.check(
  Schema.isPattern(
    /^(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)?[a-z0-9]+(?:-[a-z0-9]+)*$/,
    {
      message:
        'use the old slug or topic/slug, lowercase without accents, hyphenated',
    },
  ),
)

/** `guias/<topic>/<slug>.md`: the body holds the short answer (before the
 * first `##`), "Varia conforme o Perfil?" and "Limitações". */
export const GuideFrontmatter = Schema.Struct({
  pergunta: Text,
  confianca: Schema.Literals(STRENGTHS),
  achados: Schema.Array(GuideFinding),
  divergencia: Schema.optional(Divergence),
  dicas: Schema.optional(Slugs),
  mitos: Schema.optional(Schema.Array(Myth)),
  relacionadas: Schema.optional(Slugs),
  calculadora: Schema.optional(Schema.Literals(CALCULATORS)),
  antes: Schema.optional(Schema.Array(GuidePath)),
  seo: Schema.optional(Seo),
})
export type GuideFrontmatter = typeof GuideFrontmatter.Type
