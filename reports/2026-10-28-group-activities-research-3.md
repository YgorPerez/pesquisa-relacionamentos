# Group activities: second follow-up to issue #51

Scope: Chronomax's original report and weighted PNS 2019 dance composition. Existing PNAD and Ticket Sports fact sheets remain unchanged.

## Delivered fact sheet

`studies/ibge-2019-pns-danca.md`: verified, moderate evidence. Among respondents aged 15 or older who named dance as their most frequent exercise, the weighted composition is 88.4% women (95% CI 83.4–93.4%) and 11.6% men (6.6–16.6%). These are repository calculations, not an IBGE published table. The subgroup contains 625 respondents: 557 women and 68 men. Weighted totals are 1,337,647.54013732 dancers, including 1,182,690.19298283 women; they are population estimates, not sample counts.

The official dictionary identifies P036=16, C006=1/2, calibrated selected-person weight V00291, strata V0024 and PSU UPA_PNS. The script uses all 90,846 selected-person respondents with positive weights, aggregated into 8,027 PSUs in 574 strata. All 7,461 PSUs without dancers remain in the domain variance calculation. There are no singleton strata. The Taylor-linearized ratio uses the ultimate-cluster, with-replacement approximation without FPC; the Wald interval uses the standard normal quantile. A separate calculation using equivalent delete-one-PSU linearized jackknife contributions reproduced SE=2.5383844317958983 percentage points. Calibration uncertainty is not separately estimated.

The complete dictionary entries for exercise, sex and weights, their byte positions, and the official publication's sampling and physical-activity sections were inspected. The publication is <https://biblioteca.ibge.gov.br/visualizacao/livros/liv101764.pdf>, printed pp. 11–24 and 43–46. Its main activity results concern adults; this calculation deliberately retains all eligible selected respondents aged 15 or older. Targeted IBGE/SIDRA searches for dance in 2019 did not locate the requested composition table; the publication inspected in the preceding report also lacks it. This is not a claim that every SIDRA table was exhaustively searched.

## Public sources and reproduction

- Raw archive: <https://ftp.ibge.gov.br/PNS/2019/Microdados/Dados/PNS_2019_20220525.zip>. SHA256 `a789f6b0cbf6057111939fb3d1fe62ad1d5e848ba9c1f7860d7b44daa4be6057`.
- Dictionary and SAS input: <https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Dicionario_e_input_20220530.zip>. SHA256 `bcfed57f8835c07cac38b7343950a500759692974359e007e43217904a2f78da`.
- Both archives are retained outside the repository at `/home/servidor-azul/.cache/pesquisa-relacionamentos/pns-2019-issue51/` (`PNS_2019_20220525.zip` and `dictionary.zip`). The microdata archive expands to `PNS_2019.txt`, 455,275,300 bytes; no individual records enter git.
- `sources/ibge-2019-pns-danca.txt` contains attributed documentation excerpts. `sources/ibge-2019-pns-danca-psu.csv` contains sufficient statistics by PSU, not individual microdata. These public government-derived inputs let verification run without downloading the raw archive.
- `python3 scripts/calculations/ibge-2019-pns-danca.py` reproduces the result using only the standard library. To regenerate the aggregates, pass `extract /path/PNS_2019_20220525.zip`; extraction checks the archive checksum. Only the official positions, categories and weights enter the calculation.

## Chronomax: still ready for human access

No fact sheet was created. On 2026-10-28, web fetch of <https://estudo.chronomax.com.br/> and <https://estudo.chronomax.com.br/01> returned 502. Direct curl reported `Could not resolve host`; Google public DNS also returned NXDOMAIN for the study subdomain. Searches for a PDF, download and press kit found coverage, but no accessible complete report.

The useful new lead was the `/01` address linked by [Corrida On Demand](https://corridaondemand.com.br/inscricoes-abertas-maratona-de-sorocaba-e-piracicaba-o-recorde-da-olympikus-sn-09-02-2026/). The Wayback CDX lookup for that exact address returned a 200 HTML snapshot dated `20260516211241`. Retrieved <https://web.archive.org/web/20260516211241id_/https://estudo.chronomax.com.br/01>. It contains only metadata and an empty application root; the content requires `/assets/index-Sxpb1Lh3.js`. Retrieval of that archived JavaScript failed; CDX for the assets path returned an empty array. The bare-domain CDX lookup returned no snapshots; wildcard lookups were also attempted, including one that returned HTTP 429. The original metadata additionally names <https://chronomax.com.br/estudo>; that lead returned HTTP 404. Search-index landing-page text and press percentages were not accepted as a substitute for the complete study.

The Chronomax study needs a readable complete original (PDF, export or a working application).

Attempts and PNS results were [reported on issue #51](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/51#issuecomment-6473855179).

## Content implications

- `studies/ibge-2015-pnad-esporte.md` remains valid. PNS 2019 corroborates female predominance in a differently defined dance population; do not call the percentage difference a trend.
- `tips/convivencia-repetida.md` can cite a dated national estimate of dance's sex composition, with its interval and main-exercise restriction. It cannot call this the composition of dance classes, a local group, or the single population.
- `studies/ibge-2019-pns.md`, on sexual orientation, is a different analysis and remains unchanged. No other fact sheet or Guide needs a numerical correction on this evidence. None of these data measure meeting a romantic partner.
