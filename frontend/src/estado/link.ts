// O link recebido (#34, stories 64–65): a calculadora aberta com a query de
// "Copiar link" grava o estado do link no lugar do salvo e tira a query da
// barra, para a URL voltar a ficar limpa (story 68) e recarregar não aplicar
// o link de novo. Só a query de link (com `v`) sai; outra fica.
//
// Cada página diz como aplicar: ler com `lerLink` e gravar as partes dela. A
// opção de não ser contado (#35) não é parte de nenhuma.
import { useRouter } from '@tanstack/react-router'
import { ehLink } from '@tem-estudo/regras/link'
import { useEffect, useRef, useState } from 'react'

/** Aplica o link da barra uma vez, depois de hidratar. `aplicar` recebe a
 * query e devolve se trocou o estado (`false` para query inválida). O
 * retorno diz se trocou, para a página avisar. */
export function useLinkRecebido(aplicar: (query: string) => boolean): boolean {
  const router = useRouter()
  const [trocou, setTrocou] = useState(false)
  const feito = useRef(false)

  useEffect(() => {
    if (feito.current) return
    feito.current = true
    const { pathname, search, hash } = window.location
    if (!ehLink(search)) return
    if (aplicar(search)) setTrocou(true)
    router.history.replace(`${pathname}${hash}`)
  }, [aplicar, router])

  return trocou
}
