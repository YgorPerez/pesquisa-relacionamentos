// O laço à mão em volta da Ficha citada (DESIGN.md, assinatura). O desenho
// vem numa caixa de 100 × 100 e é refeito no tamanho real da Ficha, para o
// traço não deformar como deformaria com `preserveAspectRatio="none"`.
const LACO_100 =
  'M7 7C35 2 75 3 96 7c3 25 3 60-1 86-30 4-65 4-91 1C1 70 1 35 4 5'

/** O caminho do laço numa caixa de `largura` × `altura`: os números se
 * alternam entre x e y. */
export function laco(largura: number, altura: number): string {
  let i = 0
  return LACO_100.replace(/-?\d+(\.\d+)?/g, (n) =>
    (((i++ % 2 === 0 ? largura : altura) * Number(n)) / 100).toFixed(1),
  )
}
