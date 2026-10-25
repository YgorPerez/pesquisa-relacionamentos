// The Tabela 3 hazard ratio for each year of age gap (1.034, couples married
// since 2008) compounded over 5 and 10 years, as the press numbers "5 years =
// 18%" and "10 years = 39%" appear to do. The paper never makes this step.
//
//   node scripts/calculations/francis-tan-2015-gastos-casamento-divorcio.ts
const perYear = 1.034
const compounded = [5, 10].map((years) => perYear ** years)
console.log(compounded.map((hr) => hr.toFixed(2).replace('.', ',')).join(' '))
