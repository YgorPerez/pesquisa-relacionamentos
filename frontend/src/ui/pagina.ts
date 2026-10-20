// O que uma rota monta numa página, num import só: a folha, a coluna, o
// título e o lead (`folha.tsx`), e as peças de dentro dela (`secao.tsx`), que
// as outras peças de `ui/` importam direto. Só as rotas importam daqui: com a
// story de cada peça (ADR 0036), um arquivo de peças importado por todas as
// rotas passaria do fan-in que a `fallow health` aceita.
export { Coluna, Display, Folha, Lead } from './folha'
export { Aviso, Headline, Painel, Secao } from './secao'
