// Mulheres de 25 a 29 anos em SP que não viviam em união, somando o peso
// amostral (P0110) do microdado público do Censo 2022. Lê o CSV que o
// pipeline do Grupo possível gerou (`pnpm dados:grupo-possivel`); o SIDRA
// 10185 publica 747.507 para a mesma célula.
import { readFileSync } from 'node:fs'

const [cabecalho = '', ...linhas] = readFileSync(
  'dados/grupo-possivel/censo-2022.csv',
  'utf8',
)
  .trim()
  .split('\n')
const coluna = Object.fromEntries(
  cabecalho.split(',').map((nome, i) => [nome, i]),
)
const campo = (valores: string[], nome: string) =>
  valores[coluna[nome] ?? -1] ?? ''

let soma = 0
for (const linha of linhas) {
  const v = linha.split(',')
  if (
    campo(v, 'sexo') === 'mulher' &&
    campo(v, 'idade') === '25-29' &&
    campo(v, 'uf') === 'SP' &&
    campo(v, 'uniao') === 'nao'
  )
    soma += Number(campo(v, 'peso'))
}
console.log(Math.round(soma))
