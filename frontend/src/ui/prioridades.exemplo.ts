// Os dados de exemplo das stories de Prioridades: cinco características com
// um degrau por desfecho, a Ficha da fonte e a barra da Joel.
import type { BarraDaSatisfacao, CaracteristicaVista, FichaDaPrioridade } from '#/conteudo/vista-prioridades'

const FICHA: FichaDaPrioridade = {
  slug: 'costa-2018-satisfacao',
  nome: 'Costa (2018)',
  status: 'parcial',
  forca: 'moderada',
  amostra: 'Casais casados recrutados online.',
}

const celula = (degrau: 0 | 1 | 2 | 3, texto = 'Nenhum estudo lido mede isso.') => ({
  degrau,
  medida: null,
  texto,
  ficha: degrau > 0 ? FICHA : null,
})

export const CARACTERISTICAS: ReadonlyArray<CaracteristicaVista> = [
  { id: 'aparencia', nome: 'Aparência', atracao: celula(3), satisfacao: celula(2, 'Só um pouco, e só no começo.'), duracao: celula(0) },
  { id: 'sexo', nome: 'Química sexual', atracao: celula(3), satisfacao: celula(3), duracao: celula(0) },
  { id: 'renda', nome: 'Renda', atracao: celula(2), satisfacao: celula(0), duracao: celula(0) },
  { id: 'parecido', nome: 'Ser parecido comigo', atracao: celula(1), satisfacao: celula(1), duracao: celula(0) },
  { id: 'idade', nome: 'Idade parecida', atracao: celula(0), satisfacao: celula(0), duracao: celula(0) },
]

export const BARRA: BarraDaSatisfacao = {
  relacao: 45,
  parceiro: 5,
  semExplicacao: 50,
  ficha: { ...FICHA, nome: 'Joel et al. (2020)', status: 'ok', forca: 'forte' },
}
