---
# Antes da migração: ✅ lido no original (data: 2026-10-18)
referencia: "Francis-Tan A, Mialon HM. *\"A diamond is forever\" and other fairy tales: The relationship between wedding expenses and marriage duration*. Economic Inquiry 53(4):1919–1930, 2015. Texto completo aberto (PDF da versão publicada): https://www.csus.edu/faculty/m/fred.molitor/docs/wedding%20expenses%20and%20marriage%20duration1.pdf; SSRN: https://papers.ssrn.com/abstract=2501480"
link: https://doi.org/10.1111/ecin.12206
status: nao-verificado
forca: fraca
forca_porque: "Amostra online não probabilística, dados retrospectivos, transversal."
paises: [EUA]
periodo: "pesquisa online feita por volta de 2014"
amostra:
  n: 3151
  descricao: "3.151 pessoas que já foram casadas (1.455 homens e 1.696 mulheres), recrutadas no Amazon Mechanical Turk. Mais jovens, mais escolarizadas e de renda menor que a população (comparação com a ACS 2012). As regressões usam pesos populacionais."
  representativa: false
desenho: transversal
conflito: "Acadêmico (Emory); nada relevante encontrado."
cobre:
  generos: [homem, mulher]
---

# Francis-Tan & Mialon (2015): gastos com casamento, diferença de idade e divórcio

## O que mediu

O foco é gasto com anel e festa versus duração do casamento. Os controles incluem diferença de idade, raça e escolaridade entre os cônjuges, renda, frequência religiosa, filhos, tempo de namoro e se "aparência" ou "riqueza" do parceiro foram importantes na decisão de casar.

Desenho, como descrito antes da migração: questionário retrospectivo de cerca de 40 perguntas, analisado com modelo de riscos proporcionais de Cox para a dissolução do casamento.

## Achados

Razões de risco (hazard ratios) de divórcio, modelo multivariado, todas as pessoas, com pesos populacionais (Tabela 2):

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Diferença de idade entre os cônjuges (por ano) | 1,022 (p < 0,01) | Tabela 2 | |
| Diferença de escolaridade | 1,248 (p < 0,01) | Tabela 2 | |
| Diferença de raça | 1,180 (p < 0,10) | Tabela 2 | |
| "Aparência do parceiro foi importante" na decisão | 1,294 (p < 0,01); homens 1,485, mulheres 0,993 | Tabela 2 | |
| "Riqueza do parceiro foi importante" na decisão | 1,338 (p < 0,10); mulheres 1,570 | Tabela 2 | |
| Frequenta serviço religioso regularmente (vs. nunca) | 0,625 (p < 0,01) | Tabela 2 | |
| Renda familiar ≥ US$ 125 mil (vs. < US$ 25 mil) | 0,390 (p < 0,01) | Tabela 2 | |
| "Conhecia muito bem o cônjuge" | 0,564 (p < 0,01) | Tabela 2 | |
| Namoraram 3 anos ou mais antes do pedido (vs. < 1 ano) | 0,764 (p < 0,01) | Tabela 2 | |
| Cada ano a mais de idade ao casar | 0,912 (p < 0,01) | Tabela 2 | |
| Festa com gasto ≥ US$ 20 mil (vs. US$ 5–10 mil) | 1,323 (p < 0,10); mulheres 1,595 | Tabela 2 | |
| Festa com gasto ≤ US$ 1 mil | 0,642 (p < 0,01) | Tabela 2 | |
| Anel de US$ 2–4 mil (vs. US$ 500–2 mil), homens | 1,334 (p < 0,05) | Tabela 2 | |

- Na subamostra de casados desde 2008 (Tabela 3), a diferença de idade tem HR = 1,034 (p < 0,05) e a de escolaridade HR = 1,437 (p < 0,01).
- Os autores dizem que os achados podem ser **não causais**: o tipo de casal que gasta pouco pode ser mais compatível.

## Limitações

- **O artigo não explica como a diferença de idade foi codificada.** A média na Tabela 1 é −0,87, com 1,14 para homens e −2,59 para mulheres, o que sugere diferença com sinal (respondente menos cônjuge), e não diferença absoluta. Assim, "HR 1,022 por ano" deve ser lido com cautela.
- Números muito citados na imprensa, como "5 anos de diferença = 18% mais divórcio" e "10 anos = 39%", **não aparecem neste artigo** na forma lida. Não use esses números sem achar a fonte.
- Amostra do mTurk, dados retrospectivos e transversais, e só quem respondeu sobre o primeiro ou atual casamento.
- "Diferença de escolaridade" aparece como variável binária (média 0,59); a definição exata não foi conferida.

## Como usamos

- [Relatório 2026-10-18: características do parceiro](../relatorios/2026-10-18-caracteristicas-parceiro.md): diferença de idade e de escolaridade, religião, renda e "casar pela aparência". Toda essa evidência é fraca.
