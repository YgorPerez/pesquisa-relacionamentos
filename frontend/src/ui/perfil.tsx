// O Perfil na página (DESIGN.md, "Perfil: destacar sem esconder"): o link
// abaixo da resposta curta, a caixa com o formulário, o selo "vale para você",
// o anel vazio de "não há dado", a linha "Para o seu Perfil" e o aviso acima
// do título. Nada aqui esconde conteúdo: só marca.
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
import { Botao } from './botao'
import { Html } from './guia'

/** O link que leva à caixa e o pedido de abrir o formulário já preenchido. */
const MUDAR = 'tem-estudo:mudar-perfil'

/** Abaixo da resposta curta. Sem Perfil convida; com Perfil, resume e oferece mudar. */
export function LinkDoPerfil({ perfil }: { perfil: Perfil | null }) {
  return (
    <a
      className="link-perfil"
      href="#perfil"
      onClick={() => perfil && window.dispatchEvent(new Event(MUDAR))}
    >
      {perfil ? (
        <>
          Seu Perfil: {descreverPerfil(perfil)} <small>· mudar</small>
        </>
      ) : (
        <>
          Diga seu Perfil e veja o que vale para você <small>· opcional</small>
        </>
      )}
    </a>
  )
}

/** Acima do título, só quando nenhum achado do Guia tem dado para o Perfil. */
export function AvisoSemDado({ perfil }: { perfil: Perfil }) {
  return (
    <p className="aviso aviso-perfil" role="note">
      Nenhum estudo deste Guia separou pessoas com o seu Perfil (<b>{descreverPerfil(perfil)}</b>). O que
      segue vem de outras amostras: vale como pista, não como resposta para você.
    </p>
  )
}

/** O selo amarelo. Para quem procura ambos, diz de qual lado há dado. */
export function SeloVoce({ so }: { so?: 'homens' | 'mulheres' | undefined }) {
  return <span className="selo-voce">{so ? `vale para você quando procura ${so}` : 'vale para você'}</span>
}

/** A nota "Vale para:" de um achado ou Dica, que fica sempre. Com Perfil,
 * ganha o selo (cobre) ou o anel vazio e a frase de que não há dado. */
export function NotaValePara({ texto, veredito }: { texto: string; veredito: Veredito | null }) {
  return (
    <>
      {veredito?.cobre && <SeloVoce so={veredito.so} />}
      <p className={veredito && !veredito.cobre ? 'vale vale-sem-dado' : 'vale'}>
        {veredito && !veredito.cobre && <span className="anel-vazio" aria-hidden="true" />}
        <b>Vale para:</b> {texto}
        {veredito && !veredito.cobre && <strong> Não há dado deste estudo para o seu Perfil.</strong>}
      </p>
    </>
  )
}

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
      <p className="para-o-seu-perfil">
        <SeloVoce /> o número em destaque vem de um estudo com pessoas do seu Perfil.
      </p>
    )
  const outro = chave.achado === null ? undefined : achados[chave.achado]
  return (
    <p className="para-o-seu-perfil">
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
  if (total === 1) return comDado ? 'O único achado tem dado para o seu Perfil.' : 'O único achado não tem dado para o seu Perfil.'
  if (comDado === 0) return `Nenhum dos ${total} achados tem dado para o seu Perfil.`
  if (comDado === total) return `Os ${total} achados têm dado para o seu Perfil.`
  return `${comDado} de ${total} achados ${comDado === 1 ? 'tem' : 'têm'} dado para o seu Perfil.`
}

const ROTULO_DO_GENERO = { homem: 'homem', mulher: 'mulher', outro: 'outro' } as const
const ROTULO_DA_PROCURA = { homens: 'homens', mulheres: 'mulheres', ambos: 'ambos' } as const

function Opcoes<T extends string>({
  legenda,
  nome,
  valores,
  rotulos,
  marcado,
  aoMarcar,
}: {
  legenda: string
  nome: string
  valores: ReadonlyArray<T>
  rotulos: Record<T, string>
  marcado: T | undefined
  aoMarcar: (valor: T) => void
}) {
  return (
    <fieldset className="perfil-campo">
      <legend>{legenda}</legend>
      <div className="opcoes">
        {valores.map((valor) => (
          <label key={valor} className="opcao">
            <input
              type="radio"
              name={nome}
              value={valor}
              checked={marcado === valor}
              onChange={() => aoMarcar(valor)}
            />
            <span>{rotulos[valor]}</span>
          </label>
        ))}
      </div>
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
  const [rascunho, setRascunho] = useState<{ genero?: string; procura?: string; idade: string }>({ idade: '' })
  const [erro, setErro] = useState<string | null>(null)
  const caixa = useRef<HTMLDivElement>(null)
  const resumo = useRef<HTMLParagraphElement>(null)
  const formAberto = !perfil || editando

  const abrir = (atual: Perfil | null) => {
    setRascunho({ genero: atual?.genero, procura: atual?.procura, idade: atual?.idade?.toString() ?? '' })
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

  // Ao abrir para mudar, o foco vai para a primeira opção; ao salvar, para o resumo.
  useEffect(() => {
    if (editando) caixa.current?.querySelector<HTMLInputElement>('input:checked, input')?.focus()
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
    <div className="caixa-perfil com-reticula" ref={caixa}>
      {formAberto ? (
        <form className="perfil-form" onSubmit={salvar} aria-label="Seu Perfil">
          <Opcoes
            legenda="Você é"
            nome={`${id}-genero`}
            valores={GENEROS_DO_PERFIL}
            rotulos={ROTULO_DO_GENERO}
            marcado={rascunho.genero as Perfil['genero']}
            aoMarcar={(genero) => setRascunho((r) => ({ ...r, genero }))}
          />
          <Opcoes
            legenda="Você procura"
            nome={`${id}-procura`}
            valores={PROCURA_DO_PERFIL}
            rotulos={ROTULO_DA_PROCURA}
            marcado={rascunho.procura as Perfil['procura']}
            aoMarcar={(procura) => setRascunho((r) => ({ ...r, procura }))}
          />
          <div className="perfil-campo">
            <label htmlFor={`${id}-idade`} className="perfil-rotulo">
              Sua idade
            </label>
            <div className="perfil-idade">
              <input
                id={`${id}-idade`}
                className="campo"
                type="number"
                inputMode="numeric"
                min={IDADE_MINIMA}
                max={IDADE_MAXIMA}
                step={1}
                value={rascunho.idade}
                onChange={(e) => setRascunho((r) => ({ ...r, idade: e.target.value }))}
                aria-describedby={`${id}-idade-dica`}
              />
              <span id={`${id}-idade-dica`} className="perfil-dica">
                a partir de {IDADE_MINIMA}
              </span>
            </div>
          </div>
          {erro && (
            <p className="perfil-erro" role="alert">
              {erro}
            </p>
          )}
          <div className="perfil-acoes">
            <Botao type="submit">{rotuloDoBotao}</Botao>
            {perfil && (
              <Botao variante="leve" onClick={apagar}>
                Apagar o Perfil
              </Botao>
            )}
          </div>
          <p className="perfil-privado">Fica só neste navegador. Nada some da página.</p>
        </form>
      ) : (
        <div className="perfil-resumo">
          <p ref={resumo} tabIndex={-1}>
            Seu Perfil: <b>{descreverPerfil(perfil)}</b>
          </p>
          <Botao variante="leve" onClick={() => abrir(perfil)}>
            mudar
          </Botao>
        </div>
      )}
      {perfil && comDado !== null && (
        <p className="perfil-contagem" aria-live="polite">
          {contagem(comDado, totalDeAchados)}
        </p>
      )}
    </div>
  )
}
