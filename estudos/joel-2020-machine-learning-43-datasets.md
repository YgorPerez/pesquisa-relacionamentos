---
# Antes da migração: ✅ lido no original, via PMC (data: 2026-10-18)
referencia: "Joel S, Eastwick PW, Allison CJ, et al. *Machine learning uncovers the most robust self-report predictors of relationship quality across 43 longitudinal couples studies*. PNAS 117(32):19061–19071, 2020. Texto completo aberto: https://pmc.ncbi.nlm.nih.gov/articles/PMC7431040/"
link: https://doi.org/10.1073/pnas.1917036117
status: nao-verificado
forca: forte
forca_porque: "43 bases longitudinais, 11.196 casais, resultados agregados entre bases."
paises: []
periodo: "não informado no texto lido"
amostra:
  n: 11196
  descricao: "11.196 casais (22.163 participantes na linha de base), de 43 bases de 29 laboratórios (86 pesquisadores). Média de cerca de 4 ondas ao longo de cerca de 14 meses (de 2 a 48 meses). 2.413 medidas de linha de base, quase todas de autorrelato."
  representativa: false
desenho: meta-analise
conflito: "39 bolsas nacionais ou universitárias (NSF, SSHRC, NIMH, NICHD, Fetzer, Templeton, entre outras). Os autores declaram \"no competing interest\"."
cobre: {}
---

# Joel et al. (2020): machine learning em 43 bases de casais

## O que mediu

Quanto da satisfação e do compromisso com a relação é previsto por quatro grupos de variáveis:

1. variáveis da relação relatadas pela própria pessoa ("ator");
2. variáveis da relação relatadas pelo parceiro;
3. diferenças individuais do ator (personalidade, humor, apego etc.);
4. diferenças individuais do parceiro.

Também mediu se dá para prever a **mudança** de satisfação ao longo do tempo.

Desenho, como descrito antes da migração: longitudinal diádico; random forests aplicadas a cada base e resultados agregados (meta-análise).

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Variância da satisfação (linha de base) explicada por variáveis da relação do ator | 45% | Resultados | |
| ... por variáveis da relação do parceiro | 15% | Resultados | |
| ... por diferenças individuais do ator | 19% | Resultados | |
| ... por diferenças individuais do parceiro | 5% | Resultados | |
| ... diferenças individuais de ator + parceiro juntas | 21% | Resultados | |
| ... todas as variáveis juntas | 44% | Resultados | |
| No seguimento (fim do estudo): variáveis da relação / diferenças individuais | até 18% / até 12% | Resultados | |
| Compromisso | em média ~3 pontos percentuais abaixo da satisfação, mesmo padrão | Resultados | |
| Ganho do parceiro e das diferenças individuais além das variáveis da relação do ator | 0,0% a 1,9% (linha de base); 0,9% a 3,5% (seguimento) | Resultados | |
| Prever a **mudança** de satisfação | nenhuma análise passou de 5% | Resultados | |
| Top 5 variáveis da relação | compromisso percebido do parceiro, apreciação, satisfação sexual, satisfação percebida do parceiro, conflito | Resultados | |
| Top 5 diferenças individuais | satisfação com a vida, afeto negativo, depressão, apego evitativo, ansiedade de apego | Resultados | |
| Personalidade (taxa de sucesso como preditor entre bases) | amabilidade 54%, conscienciosidade 43%, neuroticismo 41%, abertura 37%, extroversão 28% | Tabela 3 (taxa de sucesso, não tamanho de efeito) | |

- **Interações ator × parceiro** (ou seja, combinação ou "match" entre os dois) não são mostradas porque, segundo os autores, "are likely quite small".
- Conclusão dos autores: os fatores de risco individuais "may matter little" diante dos preditores mais próximos, que são as percepções da pessoa sobre a própria relação.

## Limitações

- Quase tudo é autorrelato. Satisfação e percepções da relação vêm da mesma pessoa, o que infla as associações do ator (variância de método compartilhada).
- As percepções da relação (compromisso percebido, apreciação) **não são características do parceiro observáveis antes** de começar a relação. O estudo mostra o que prevê qualidade *dentro* de uma relação, não como escolher alguém.
- Prever mudança ao longo do tempo funcionou mal (≤ 5%).
- Seguimento médio curto (cerca de 14 meses).
- Desenho classificado como `meta-analise` na migração; conferir na fonte.

## Como usamos

- [Relatório 2026-10-18: características do parceiro](../relatorios/2026-10-18-caracteristicas-parceiro.md): principal evidência de que traços do parceiro explicam pouco e a dinâmica da relação explica muito.
