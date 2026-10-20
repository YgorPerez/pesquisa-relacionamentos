// As leituras das páginas, guardadas no QueryClient do router (`router.tsx`,
// ADR 0031). O loader de cada rota pede a dele com `queryClient.query`, e a
// tela a lê com `useSuspenseQuery`: no servidor, o que o loader leu vai junto
// do HTML (`@tanstack/react-router-ssr-query`), e o navegador hidrata sem
// pedir de novo.
//
// O acervo entra no build (`vite/acervo.ts`): até o próximo deploy, nada do
// que estas funções devolvem muda. Por isso toda leitura é `static`, nunca
// velha: voltar a uma página já lida não sai para a rede.
import { QueryClient, queryOptions } from '@tanstack/react-query'
import { buscarFicha, listarFichas } from './fichas'
import {
  buscarDica,
  buscarGuia,
  buscarGuiaDaCalculadora,
  buscarPrioridades,
  buscarTema,
  listarDicas,
  listarTemas,
} from './guias'

/** Um por router: o servidor cria um por pedido, e o que um visitante leu
 * não vaza para o próximo. */
export function criarQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 'static' } },
  })
}

export const leituras = {
  /** Os Temas com as Perguntas, para o início. */
  temas: () =>
    queryOptions({ queryKey: ['temas'], queryFn: () => listarTemas() }),
  tema: (tema: string) =>
    queryOptions({
      queryKey: ['tema', tema],
      queryFn: () => buscarTema({ data: tema }),
    }),
  guia: (tema: string, slug: string) =>
    queryOptions({
      queryKey: ['guia', tema, slug],
      queryFn: () => buscarGuia({ data: { tema, slug } }),
    }),
  /** O Guia que hospeda a calculadora, para o bloco "Do Guia". */
  guiaDaCalculadora: (calculadora: string) =>
    queryOptions({
      queryKey: ['guia-da-calculadora', calculadora],
      queryFn: () => buscarGuiaDaCalculadora({ data: calculadora }),
    }),
  fichas: () =>
    queryOptions({ queryKey: ['fichas'], queryFn: () => listarFichas() }),
  ficha: (slug: string) =>
    queryOptions({
      queryKey: ['ficha', slug],
      queryFn: () => buscarFicha({ data: slug }),
    }),
  dicas: () =>
    queryOptions({ queryKey: ['dicas'], queryFn: () => listarDicas() }),
  dica: (slug: string) =>
    queryOptions({
      queryKey: ['dica', slug],
      queryFn: () => buscarDica({ data: slug }),
    }),
  prioridades: () =>
    queryOptions({
      queryKey: ['prioridades'],
      queryFn: () => buscarPrioridades(),
    }),
}
