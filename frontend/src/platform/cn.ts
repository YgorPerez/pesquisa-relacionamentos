// O `cn` do app: o do pacote `cn`, que junta as classes com a semântica do
// tailwind-merge, sabendo das escalas que o `@theme` de `ui/tokens.css`
// declara. Sem isto ele não reconhece um nome que não seja do Tailwind, e lia
// `text-label` como cor de texto.
//
// As tabelas vêm prontas de `cn-tabelas.js`, que o `pnpm cn:tabelas` gera do
// `@theme`, para o navegador não compilá-las na primeira chamada (o mesmo do
// Festival dos Macacos). `cn.test.ts` confere que cada nome do tema está nas
// tabelas, e que elas são as que o `styles.css` de hoje gera.

import { createCn } from 'cn/engine'
import tabelas from './cn-tabelas'

export const cn = createCn(tabelas)
