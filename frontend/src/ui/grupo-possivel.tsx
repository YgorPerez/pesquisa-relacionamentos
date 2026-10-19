// As peças da página do Grupo possível (#19, variante A): o número preso no
// topo, os controles dos Requisitos (todos sem arrastar: botões de passo,
// campo de número, opções e caixas de marcar) e a conta com as dobras.
import type {
  Custo,
  Estimativa,
  RequisitoId,
} from '@tem-estudo/regras/grupo-possivel'
import {
  formatarFaixa,
  formatarQuantidade,
  formatarVezes,
} from '@tem-estudo/regras/numeros'
import type { Perfil } from '@tem-estudo/regras/perfil'
import {
  TITULO_DO_REQUISITO,
  valorDoRequisito,
  type Requisitos,
} from '@tem-estudo/regras/requisitos'
import { Link } from '@tanstack/react-router'
import { useId, type ReactNode } from 'react'
import { NumberField } from '@base-ui/react/number-field'
import { cn } from '@/platform/cn'
import { Button } from '@/ui/shadcn/button'
import { Checkbox } from '@/ui/shadcn/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/shadcn/collapsible'
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group'
import { NOME_DO_ALVO, textoDoCusto } from './grupo-possivel.textos'
import { Headline, Secao } from './pagina'

/** Enquanto os dados chegam, o número antigo fica, apagado. */
const CARREGANDO =
  'opacity-55 motion-safe:transition-opacity motion-safe:delay-150 motion-safe:duration-200 motion-safe:ease-sai'

/** A nota miúda embaixo de um controle ou na conta. */
const DICA = 'm-0 mt-2 text-label leading-nota font-normal text-tinta-2'

/** A faixa com os números no marca-texto rosa e, se for o caso, "instável". */
export function Faixa({ estimativa }: { estimativa: Estimativa }) {
  const { min, max, instavel } = estimativa.resultado
  const texto = formatarFaixa(min, max)
  const [, antes = '', numeros = texto] =
    /^(entre |cerca de )?(.*)$/.exec(texto) ?? []
  return (
    <p
      className="m-0 mt-0.5 font-headline text-headline leading-tight"
      data-slot="gp-faixa"
    >
      {antes}
      <mark className="numero-chave">{numeros}</mark>
      {instavel && (
        <span className="ml-2.5 inline-block rounded-mao-2 border-(length:--traco-controle) fio-tracejado border-tinta px-2 py-0 align-[3px] font-label text-label leading-tight font-bold tracking-normal">
          instável
        </span>
      )}
    </p>
  )
}

/** "o que mais pesa: idade (×3,4)". */
function MaisPesa({ estimativa }: { estimativa: Estimativa }) {
  const primeiro = estimativa.custos[0]
  if (!primeiro) return <>nenhum Requisito corta o grupo</>
  return (
    <>
      o que mais pesa:{' '}
      <b>
        {TITULO_DO_REQUISITO[
          primeiro.requisito as keyof typeof TITULO_DO_REQUISITO
        ].toLowerCase()}
      </b>{' '}
      ({formatarVezes(primeiro.vezes)})
    </>
  )
}

/** O Grupo possível preso no topo enquanto a página rola. */
export function NumeroPreso({
  estimativa,
  carregando,
}: {
  estimativa: Estimativa
  carregando: boolean
}) {
  return (
    <section
      className="sticky top-0 z-2 -mx-xs rounded-mao border-2 border-tinta bg-folha px-3.5 pt-2.5 pb-2"
      aria-labelledby="gp-preso-titulo"
      aria-busy={carregando}
      data-slot="gp-preso"
    >
      <h2
        id="gp-preso-titulo"
        className="m-0 font-label text-label text-tinta-2"
      >
        Grupo possível
      </h2>
      <div
        aria-live="polite"
        aria-atomic="true"
        className={carregando ? CARREGANDO : undefined}
      >
        <Faixa estimativa={estimativa} />
      </div>
      <p className="m-0 mt-xs flex flex-wrap items-center justify-between gap-x-3 gap-y-0 text-nota leading-label">
        <span>
          <MaisPesa estimativa={estimativa} />
        </span>
        <a
          href="#a-conta"
          className="inline-flex min-h-toque items-center font-bold"
        >
          ver a conta
        </a>
      </p>
    </section>
  )
}

/** Uma linha de Requisito: título, valor de agora, controle e custo. */
export function LinhaDoRequisito({
  requisito,
  valor,
  custo,
  ligado,
  children,
  nota,
}: {
  requisito: keyof typeof TITULO_DO_REQUISITO
  valor: string
  custo: Custo | undefined
  ligado: boolean
  children: ReactNode
  nota?: ReactNode
}) {
  return (
    <div
      className="border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta pt-md pb-sm first:border-t-0 first:pt-1"
      id={`req-${requisito}`}
    >
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h3 className="m-0 font-title text-title leading-body font-bold">
          {TITULO_DO_REQUISITO[requisito]}
        </h3>
        <span
          className={cn(
            'text-aviso font-bold',
            ligado && 'rounded-mao-2 bg-amarelo-voce px-1',
          )}
          data-slot="gp-req-valor"
        >
          {valor}
        </span>
      </div>
      {children}
      {nota}
      <p
        className="m-0 mt-2.5 min-h-[1.4em] text-nota text-tinta-2"
        data-slot="gp-req-custo"
      >
        {custo ? textoDoCusto(custo) : ligado ? '' : 'não corta ninguém'}
      </p>
    </div>
  )
}

const Menos = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M3 9.2c4-.3 8-.1 12-.3" />
  </svg>
)
const Mais = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M3 9.2c4-.3 8-.1 12-.3M9.1 3c-.2 4 .1 8-.1 12" />
  </svg>
)

/** Um número com botões de passo e campo para digitar: troca o slider, que
 * pede arrastar. Cada toque muda o valor e a conta. O `NumberField` do Base UI
 * cuida dos passos, das setas do teclado e do campo; só o inteiro dentro da
 * faixa chega ao Requisito. */
export function Passos({
  rotulo,
  valor,
  min,
  max,
  passo = 1,
  unidade,
  aoMudar,
}: {
  rotulo: string
  valor: number
  min: number
  max: number
  passo?: number
  /** "anos", "cm"; recebe o valor para dizer "80 ou mais". */
  unidade: (valor: number) => string
  aoMudar: (valor: number) => void
}) {
  const id = useId()
  return (
    <NumberField.Root
      id={id}
      value={valor}
      min={min}
      max={max}
      step={passo}
      onValueChange={(n) => {
        // Vazio ou incompleto não muda o Requisito: só o inteiro na faixa.
        if (n !== null && Number.isInteger(n) && n >= min && n <= max)
          aoMudar(n)
      }}
    >
      <label htmlFor={id} className="mb-1.5 block text-nota font-bold">
        {rotulo}
      </label>
      <NumberField.Group className="flex items-center gap-1.5">
        <NumberField.Decrement
          className={PASSO}
          disabled={valor <= min}
          aria-label={`${rotulo}: menos ${passo}`}
        >
          <Menos />
        </NumberField.Decrement>
        <NumberField.Input
          className="min-h-toque w-[4.2rem] rounded-mao-2 border-(length:--traco-controle) border-tinta bg-papel px-2.5 py-1.5 text-center font-body text-grande font-bold text-tinta"
          inputMode="numeric"
          aria-describedby={`${id}-unidade`}
        />
        <NumberField.Increment
          className={PASSO}
          disabled={valor >= max}
          aria-label={`${rotulo}: mais ${passo}`}
        >
          <Mais />
        </NumberField.Increment>
        <span id={`${id}-unidade`} className="text-nota text-tinta-2">
          {unidade(valor)}
        </span>
      </NumberField.Group>
    </NumberField.Root>
  )
}

/** O botão de passo: o quadrado de 44px, amarelo enquanto apertado. */
const PASSO =
  'inline-grid size-toque cursor-pointer place-items-center rounded-mao border-(length:--traco-controle) border-tinta bg-folha p-0 active:not-disabled:bg-amarelo-voce disabled:cursor-default disabled:opacity-40'

/** Opções em chips: a opção inteira é o rádio ou a caixa de marcar. */
export function Opcoes<T extends string>({
  legenda,
  tipo,
  valores,
  rotulos,
  marcados,
  aoMudar,
  dica,
}: {
  legenda: string
  tipo: 'radio' | 'checkbox'
  valores: ReadonlyArray<T>
  rotulos: Readonly<Record<T, string>>
  marcados: ReadonlyArray<T>
  aoMudar: (valor: T, marcado: boolean) => void
  dica?: string
}) {
  const id = useId()
  const marcado = new Set(marcados)
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend id={id} className="sr-only">
        {legenda}
      </legend>
      {tipo === 'radio' ? (
        <RadioGroup
          aria-labelledby={id}
          value={marcados[0] ?? null}
          onValueChange={(valor) => aoMudar(valor as T, true)}
        >
          {valores.map((valor) => (
            <RadioGroupItem key={valor} value={valor}>
              {rotulos[valor]}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      ) : (
        <div className="flex flex-wrap gap-2">
          {valores.map((valor) => (
            <span key={valor} className="relative">
              <Checkbox
                checked={marcado.has(valor)}
                onCheckedChange={(sim) => aoMudar(valor, sim)}
              >
                {rotulos[valor]}
              </Checkbox>
            </span>
          ))}
        </div>
      )}
      {dica && <p className={DICA}>{dica}</p>}
    </fieldset>
  )
}

/** Uma caixa de marcar em forma de chip ("Só quem não fuma"). */
export function Marcar({
  rotulo,
  marcado,
  aoMudar,
  desabilitado,
  descricao,
}: {
  rotulo: string
  marcado: boolean
  aoMudar: (marcado: boolean) => void
  desabilitado?: boolean
  descricao?: string
}) {
  return (
    <span
      className={cn(
        'relative inline-flex',
        desabilitado ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <Checkbox
        visto
        checked={marcado}
        disabled={desabilitado}
        aria-describedby={descricao}
        onCheckedChange={(sim) => aoMudar(sim)}
      >
        <Visto marcado={marcado} />
        {rotulo}
      </Checkbox>
    </span>
  )
}

const Visto = ({ marcado }: { marcado: boolean }) => (
  <svg
    className="flex-none"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 3.4c4.6-.4 9.2-.2 13.8-.3.3 4.5.2 9 .3 13.5-4.6.3-9.2.2-13.8.3-.2-4.5-.1-9-.3-13.5Z" />
    {marcado && <path d="M5.6 10.4l3 3.1 6-7.6" strokeWidth="2.2" />}
  </svg>
)

/** O corte a corte e a incerteza, recolhidos. */
export function Dobras({
  estimativa,
  perfil,
  requisitos,
  municipio,
}: {
  estimativa: Estimativa
  perfil: Perfil | null
  requisitos: Requisitos
  municipio: string | undefined
}) {
  const { base, funil, ingenua, ressalvas, ligados, resultado } = estimativa
  const diferenca =
    resultado.central > 0
      ? (ingenua - resultado.central) / resultado.central
      : 0
  const valor = (k: RequisitoId) =>
    valorDoRequisito(k, perfil, requisitos, municipio)
  return (
    <>
      <Collapsible id="gp-corte-a-corte" variante="cheia" className="mt-sm">
        <CollapsibleTrigger variante="cheia">
          Corte a corte
        </CollapsibleTrigger>
        <CollapsibleContent hiddenUntilFound>
        <ol className="m-0 list-none p-0" data-slot="gp-funil">
          <li>
            <span>
              {NOME_DO_ALVO[estimativa.alvo]} de 18 anos ou mais no Brasil
            </span>
            <b>{formatarQuantidade(base.central)}</b>
          </li>
          {funil.map((etapa) => (
            <li key={etapa.requisito}>
              <span>{valor(etapa.requisito)}</span>
              <b>{formatarQuantidade(etapa.central)}</b>
            </li>
          ))}
        </ol>
        <p className={DICA}>
          A ordem dos cortes não muda o resultado final.
        </p>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible id="gp-incerteza" variante="cheia" className="mt-sm">
        <CollapsibleTrigger variante="cheia">
          De onde vem a incerteza
        </CollapsibleTrigger>
        <CollapsibleContent hiddenUntilFound>
        {ligados.length > 1 && (
          <p className="m-0 mb-2.5 text-aviso">
            Se só multiplicássemos a porcentagem que cada Requisito deixa
            sozinho no Brasil, daria <b>{formatarQuantidade(ingenua)}</b> (
            {diferenca >= 0 ? '+' : '−'}
            {Math.abs(Math.round(diferenca * 100))}%). Os Requisitos andam
            juntos; por isso o site cruza os dados.
          </p>
        )}
        <p className={DICA}>
          A faixa junta o erro de amostra do Censo (
          {Math.round(resultado.registros).toLocaleString('pt-BR')} registros)
          com o intervalo da PNS.
        </p>
        <ul className="mx-0 mt-2.5 mb-sm pl-marcador-curto text-nota leading-normal">
          {ressalvas
            .filter((r) => !r.forte)
            .map((r) => (
              <li key={r.id} className="not-first:mt-1.5">
                {r.texto}
              </li>
            ))}
        </ul>
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}

const Seta = () => (
  <svg
    width="26"
    height="16"
    viewBox="0 0 26 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 8.5C9 7.4 16 8.2 23 8M23 8l-6-5.5M23 8l-6 5.5" />
  </svg>
)

/** "370 mil adultos", "1,2 milhão de adultos": só o número vai no rosa. */
function AdultosNoBrasil({ quantidade }: { quantidade: number }) {
  const numero = formatarQuantidade(quantidade)
  return (
    <>
      <mark className="numero-chave">{numero}</mark>
      {numero.includes('milh') ? ' de adultos' : ' adultos'}
    </>
  )
}

/** O cartão do Guia B5 (#19, variante A). Sem uso, o número do Brasil inteiro
 * e o convite; com Perfil ou Requisitos, a conta de agora em resumo. */
export function CartaoDoGrupoPossivel({
  estimativa,
  usado,
  ligados,
  carregando,
}: {
  estimativa: Estimativa
  /** O visitante já disse o Perfil ou mexeu nos Requisitos. */
  usado: boolean
  /** Os Requisitos ligados, escritos como na frase ("25 a 35 anos"). */
  ligados: ReadonlyArray<string>
  carregando: boolean
}) {
  return (
    <Secao aria-labelledby="t-cartao-gp">
      <Headline id="t-cartao-gp">
        {usado ? 'Seu Grupo possível' : 'Faça a conta'}
      </Headline>
      <div className="reticula rounded-mao border-2 border-tinta bg-folha px-md pt-md pb-4 [&>p]:m-0 [&>p]:mt-xs">
        {usado ? (
          <div
            aria-busy={carregando}
            className={carregando ? CARREGANDO : undefined}
          >
            <Faixa estimativa={estimativa} />
            <p className="m-0 mt-1 text-nota leading-normal text-tinta-2">
              {NOME_DO_ALVO[estimativa.alvo]} que atendem a tudo o que você
              pediu
            </p>
            <p
              className="m-0 mt-2 text-nota leading-normal text-tinta-2 [&_b]:text-tinta"
              data-slot="cartao-gp-ligados"
            >
              Seus Requisitos:{' '}
              {ligados.length > 0
                ? ligados.map((valor, i) => (
                    <span key={valor}>
                      {i > 0 && ', '}
                      <b>{valor}</b>
                    </span>
                  ))
                : 'nenhum'}
              .
            </p>
            <p
              className="m-0 mt-2 text-nota leading-normal text-tinta-2 [&_b]:text-tinta"
              data-slot="cartao-gp-pesa"
            >
              <MaisPesa estimativa={estimativa} />
            </p>
          </div>
        ) : (
          <>
            <p className="font-label text-label leading-body text-tinta-2">
              Grupo possível
            </p>
            <p
              className="font-title text-frase-do-cartao leading-nota font-semibold tracking-title"
              data-slot="cartao-gp-frase"
            >
              No Brasil,{' '}
              <AdultosNoBrasil quantidade={estimativa.resultado.central} /> não
              moram com companheiro(a). Quantos deles atendem ao que você
              procura?
            </p>
          </>
        )}
        <p>
          <Button
            nativeButton={false}
            render={<Link to="/grupo-possivel" />}
            forma="seta"
          >
            {usado ? 'Ajustar os Requisitos' : 'Fazer a conta'}
            <Seta />
          </Button>
        </p>
      </div>
    </Secao>
  )
}
