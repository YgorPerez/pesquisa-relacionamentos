// O Perfil na página (DESIGN.md, "Perfil: destacar sem esconder"): o link
// abaixo da resposta curta, a caixa com o formulário, o selo "vale para você",
// o anel vazio de "não há dado", a linha "Para o seu Perfil" e o aviso acima
// do título. Nada aqui esconde conteúdo: só marca. Amarelo só para o que vale
// para você; "não há dado" é anel vazio em tinta, sem rosa (The Three Inks
// Rule).
import {
  descreverPerfil,
  GENEROS_DO_PERFIL,
  IDADE_MAXIMA,
  IDADE_MINIMA,
  lerPerfil,
  PROCURA_DO_PERFIL,
  type Perfil,
} from '@tem-estudo/regras/perfil'
import type { PerfilNoGuia } from '@tem-estudo/regras/perfil-no-guia'
import type { Veredito } from '@tem-estudo/regras/vale-para-voce'
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { gravarPerfil } from '#/estado/perfil'
import { cn } from '@/platform/cn'
import { Botao } from './botao'
import { Html } from './guia'
import { Aviso } from './pagina'
import { Input } from '@/ui/shadcn/input'
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group'

/** O link que leva à caixa e o pedido de abrir o formulário já preenchido. */
const MUDAR = 'tem-estudo:mudar-perfil'

const MIUDO = 'text-etiqueta font-normal text-tinta-2'

/** Abaixo da resposta curta. Sem Perfil convida; com Perfil, resume e oferece
 * mudar. O sublinhado é tracejado. */
export function LinkDoPerfil({ perfil }: { perfil: Perfil | null }) {
  return (
    <a
      className="m-0 mb-xs inline-block min-h-toque px-0 pt-3 pb-1 font-label text-aviso leading-label font-bold underline decoration-dashed decoration-2 underline-offset-5"
      href="#perfil"
      onClick={() => perfil && window.dispatchEvent(new Event(MUDAR))}
    >
      {perfil ? (
        <>
          Seu Perfil: {descreverPerfil(perfil)}{' '}
          <small className={MIUDO}>· mudar</small>
        </>
      ) : (
        <>
          {/* Um texto só, com o espaço: o tracejado do sublinhado segue o
              texto, e partido em dois ele recomeçava no espaço. */}
          {'Diga seu Perfil e veja o que vale para você '}
          <small className={MIUDO}>· opcional</small>
        </>
      )}
    </a>
  )
}

/** Acima do título, só quando nenhum achado do Guia tem dado para o Perfil. */
export function AvisoSemDado({ perfil }: { perfil: Perfil }) {
  return (
    <Aviso className="m-0 mt-md" role="note" data-slot="aviso-perfil">
      Nenhum estudo deste Guia separou pessoas com o seu Perfil (
      <b>{descreverPerfil(perfil)}</b>). O que segue vem de outras amostras:
      vale como pista, não como resposta para você.
    </Aviso>
  )
}

/** O selo amarelo. Para quem procura ambos, diz de qual lado há dado. */
export function SeloVoce({
  so,
  className,
}: {
  so?: 'homens' | 'mulheres' | undefined
  className?: string
}) {
  return (
    <span
      className={cn(
        'mt-1.5 mr-2 mb-0 ml-0 inline-block rounded-mao-2 bg-amarelo-voce px-2 py-px font-label text-label text-tinta',
        className,
      )}
      data-slot="selo-voce"
    >
      {so ? `vale para você quando procura ${so}` : 'vale para você'}
    </span>
  )
}

/** A nota "Vale para:" de um achado ou Dica, que fica sempre. Com Perfil,
 * ganha o selo (cobre) ou o anel vazio e a frase de que não há dado. */
export function NotaValePara({
  texto,
  veredito,
}: {
  texto: string
  veredito: Veredito | null
}) {
  return (
    <>
      {veredito?.cobre && <SeloVoce so={veredito.so} />}
      <p
        className="m-0 mt-xs text-label leading-nota font-normal text-tinta-2"
        data-slot="vale"
      >
        {veredito && !veredito.cobre && (
          <span
            className="mr-1.5 inline-block size-3 rounded-bolota border-(length:--traco-controle) border-tinta align-[-1px]"
            aria-hidden="true"
            data-slot="anel-vazio"
          />
        )}
        <b className="text-tinta">Vale para:</b> {texto}
        {veredito && !veredito.cobre && (
          <strong className="text-tinta">
            {' '}
            Não há dado deste estudo para o seu Perfil.
          </strong>
        )}
      </p>
    </>
  )
}

const PARA_O_SEU_PERFIL =
  'm-0 mt-3 border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta pt-2.5 text-aviso leading-normal'

/** "Para o seu Perfil: …", abaixo da resposta curta, depois da linha pontilhada. */
export function ParaOSeuPerfil({
  chave,
  achados,
}: {
  chave: PerfilNoGuia['chave']
  achados: ReadonlyArray<{ readonly html: string }>
}) {
  if (!chave) return null
  if (chave.vale)
    return (
      <p className={PARA_O_SEU_PERFIL} data-slot="para-o-seu-perfil">
        <SeloVoce className="mt-0" /> o número em destaque vem de um estudo com
        pessoas do seu Perfil.
      </p>
    )
  const outro = chave.achado === null ? undefined : achados[chave.achado]
  return (
    <p className={PARA_O_SEU_PERFIL} data-slot="para-o-seu-perfil">
      <b>Para o seu Perfil:</b>{' '}
      {outro ? (
        <>
          o número em destaque vem de outra amostra. O que tem dado para você:{' '}
          <Html como="span" html={outro.html} />
        </>
      ) : (
        'nenhum número deste Guia vem de uma amostra como a sua.'
      )}
    </p>
  )
}

function contagem(comDado: number, total: number): string {
  if (total === 1)
    return comDado
      ? 'O único achado tem dado para o seu Perfil.'
      : 'O único achado não tem dado para o seu Perfil.'
  if (comDado === 0)
    return `Nenhum dos ${total} achados tem dado para o seu Perfil.`
  if (comDado === total)
    return `Os ${total} achados têm dado para o seu Perfil.`
  return `${comDado} de ${total} achados ${comDado === 1 ? 'tem' : 'têm'} dado para o seu Perfil.`
}

const ROTULO_DO_GENERO = {
  homem: 'homem',
  mulher: 'mulher',
  outro: 'outro',
} as const
const ROTULO_DA_PROCURA = {
  homens: 'homens',
  mulheres: 'mulheres',
  ambos: 'ambos',
} as const

const CAMPO = 'm-0 mb-sm border-0 p-0'
const ROTULO = 'mb-2 block p-0 font-bold'
const NOTA = 'text-label leading-body font-normal text-tinta-2'

function Opcoes<T extends string>({
  legenda,
  valores,
  rotulos,
  marcado,
  aoMarcar,
}: {
  legenda: string
  valores: ReadonlyArray<T>
  rotulos: Record<T, string>
  marcado: T | undefined
  aoMarcar: (valor: T) => void
}) {
  const id = useId()
  return (
    <fieldset className={CAMPO}>
      <legend id={id} className={ROTULO}>
        {legenda}
      </legend>
      <RadioGroup
        aria-labelledby={id}
        value={marcado ?? null}
        onValueChange={(valor) => aoMarcar(valor as T)}
      >
        {valores.map((valor) => (
          <RadioGroupItem key={valor} value={valor}>
            {rotulos[valor]}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </fieldset>
  )
}

/** A caixa em "Varia conforme o Perfil?": o formulário (opcional, nada é
 * obrigatório) ou o resumo com "mudar", e a contagem de achados com dado. */
export function CaixaDoPerfil({
  perfil,
  comDado,
  totalDeAchados,
  rotuloDoBotao = 'Ver o que vale para mim',
}: {
  perfil: Perfil | null
  comDado: number | null
  totalDeAchados: number
  /** O texto do botão que salva; a calculadora usa o dela. */
  rotuloDoBotao?: string
}) {
  const id = useId()
  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState<{
    genero?: string
    procura?: string
    idade: string
  }>({ idade: '' })
  const [erro, setErro] = useState<string | null>(null)
  const caixa = useRef<HTMLDivElement>(null)
  const resumo = useRef<HTMLParagraphElement>(null)
  const formAberto = !perfil || editando

  const abrir = (atual: Perfil | null) => {
    setRascunho({
      genero: atual?.genero,
      procura: atual?.procura,
      idade: atual?.idade?.toString() ?? '',
    })
    setErro(null)
    setEditando(true)
  }

  // O link "Seu Perfil: … · mudar" lá em cima abre o formulário aqui.
  // O evento lê o Perfil de agora, sem refazer a escuta a cada mudança.
  const aoPedir = useEffectEvent(() => abrir(perfil))
  useEffect(() => {
    const ouvir = () => aoPedir()
    window.addEventListener(MUDAR, ouvir)
    return () => window.removeEventListener(MUDAR, ouvir)
  }, [])

  // Ao abrir para mudar, o foco vai para a opção marcada, ou para a primeira.
  useEffect(() => {
    if (editando)
      caixa.current
        ?.querySelector<HTMLElement>(
          '[role="radio"][aria-checked="true"], [role="radio"]',
        )
        ?.focus()
  }, [editando])

  const salvar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const novo = lerPerfil(rascunho)
    if (!novo) {
      setErro('Escolha ao menos uma opção ou diga a sua idade.')
      return
    }
    gravarPerfil(novo)
    setEditando(false)
    requestAnimationFrame(() => resumo.current?.focus())
  }

  const apagar = () => {
    gravarPerfil(null)
    setEditando(false)
    setRascunho({ idade: '' })
  }

  return (
    <div
      className="reticula mt-md rounded-mao-2 border-2 border-tinta bg-folha p-4"
      ref={caixa}
    >
      {formAberto ? (
        <form onSubmit={salvar} aria-label="Seu Perfil">
          <Opcoes
            legenda="Você é"
            valores={GENEROS_DO_PERFIL}
            rotulos={ROTULO_DO_GENERO}
            marcado={rascunho.genero as Perfil['genero']}
            aoMarcar={(genero) => setRascunho((r) => ({ ...r, genero }))}
          />
          <Opcoes
            legenda="Você procura"
            valores={PROCURA_DO_PERFIL}
            rotulos={ROTULO_DA_PROCURA}
            marcado={rascunho.procura as Perfil['procura']}
            aoMarcar={(procura) => setRascunho((r) => ({ ...r, procura }))}
          />
          <div className={CAMPO}>
            <label htmlFor={`${id}-idade`} className={ROTULO}>
              Sua idade
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              <Input
                id={`${id}-idade`}
                type="number"
                inputMode="numeric"
                min={IDADE_MINIMA}
                max={IDADE_MAXIMA}
                step={1}
                value={rascunho.idade}
                onChange={(e) =>
                  setRascunho((r) => ({ ...r, idade: e.target.value }))
                }
                aria-describedby={`${id}-idade-dica`}
              />
              <span id={`${id}-idade-dica`} className={NOTA}>
                a partir de {IDADE_MINIMA}
              </span>
            </div>
          </div>
          {erro && (
            <p className="m-0 mb-sm font-bold" role="alert">
              {erro}
            </p>
          )}
          <div className="flex flex-wrap gap-2.5">
            <Botao type="submit">{rotuloDoBotao}</Botao>
            {perfil && (
              <Botao variante="leve" onClick={apagar}>
                Apagar o Perfil
              </Botao>
            )}
          </div>
          <p className={cn('m-0 mt-sm', NOTA)}>
            Fica só neste navegador. Nada some da página.
          </p>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <p ref={resumo} tabIndex={-1} className="m-0">
            Seu Perfil:{' '}
            <b className="bg-amarelo-voce px-0.75 box-decoration-clone">
              {descreverPerfil(perfil)}
            </b>
          </p>
          <Botao variante="leve" onClick={() => abrir(perfil)}>
            mudar
          </Botao>
        </div>
      )}
      {perfil && comDado !== null && (
        <p
          className="m-0 mt-sm border-t-(length:--traco-etiqueta) fio-pontilhado border-tinta pt-2.5 text-aviso font-bold"
          aria-live="polite"
          data-slot="perfil-contagem"
        >
          {contagem(comDado, totalDeAchados)}
        </p>
      )}
    </div>
  )
}
