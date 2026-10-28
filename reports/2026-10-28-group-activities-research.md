# Group activities in Brazil: issue #51 follow-up

Research date: 2026-10-28. Branch: `acervo/51-atividades-em-grupo-2`. The PNAD 2015 sports and PNAD Contínua 2022 volunteering fact sheets were already merged through PR #91 and were not changed.

## New fact sheet

`studies/ticketsports-2025-perfil-atleta.md`: verified, weak evidence. The complete 34-page *Perfil do Atleta Brasileiro 2025/2026* was downloaded and read. The gender charts on pages 8 and 28 were also inspected visually. The report gives 52.4% female participation overall and 54.4% through its sports-group module. These are commercial platform figures, with no clear explanation of deduplication for the gender charts. They cannot establish the composition of all Brazilian runners or recurring training groups.

The PDF distinguishes the share of registration sales for road running (89.9%, p. 15) from its share of revenue (75.3%, p. 16). The publisher's [HUB announcement](https://hub.ticketsports.com.br/perfil-atleta-brasileiro-2025-ticket-sports/) incorrectly describes the latter as registrations. Group sales are predominantly road running, but the report does not cross gender with sport. Do not relabel its overall gender percentage as the percentage for road running alone.

## Private sources awaiting the orchestrator's commit

No files were committed in the shared private repository.

| Local file | Download URL | Reading and use |
|---|---|---|
| `sources/private/ticketsports-2025-perfil-atleta.pdf` | <https://d335luupugsy2.cloudfront.net/cms/files/48637/1768256633148Perfil_do_atleta-Ticket-Sports_2025-2026_v2.pdf> | Complete original; source of the new fact sheet. The public download URL is base64-encoded in the `data-asset-action` attribute of <https://materiais.ticketsports.com.br/perfil-do-atleta-brasileiro-25-26>. No form, personal information or marketing consent was submitted. |
| `sources/private/ministerioesporte-2016-diesporte.pdf` | <https://cev.org.br/media/biblioteca/4033637.pdf> | Original Ministry of Sport report, Caderno 2, 70 pages, read for methods, results and qualifications. Saved conservatively as private because the downloaded copy has no explicit reuse license. No new fact sheet: it does not improve the existing PNAD composition figures. |

## Other sources and gaps

### Diesporte

The [CEV catalog and download discussion](https://cev.org.br/comunidade/ef-esporte/debate/diesporte-2-para-baixar-diagnostico-nacional-do-esporte-caderno-2/) identify the 2016 report. It uses 8,902 interviews with people aged 15–74, reporting activity in 2013. It describes stratified probability sampling and fieldwork across all states (pp. 13–20). It is older than PNAD 2015, rather than a recent update.

Table 8 reports sport choices **within each gender**, allowing up to three sports. Its running percentages are not the percentage of runners who are men or women. Dance is grouped with other individual sports; p. 45 mentions dance in prose without a standalone composition table. No ratio was calculated from these different denominators. The report itself warns on p. 33 that small sport cells cannot reliably estimate population participation. It also has editorial inconsistencies, such as the activity-imagery table repeating the sport-imagery table and different sedentary/dropout figures across sections. Use the already merged PNAD sheet for the historical composition comparison.

The old Caderno 1 endpoint <https://arquivo.esporte.gov.br/diesporte/diesporte_grafica.pdf> returned HTML, not a readable PDF. The Caderno 2 mirror supplied the longer original report instead.

### Dance and PNS 2019

Downloaded the original IBGE publication at <https://biblioteca.ibge.gov.br/visualizacao/livros/liv101764.pdf> to `/tmp/pns2019-51.pdf`. Read the physical-activity results on pp. 43–46 and searched the extracted publication for dance and exercise-type tables. This is a section-level check, not a claim to have read the entire health publication. Dance appears as an example of moderate exercise, not as a published gender-composition table in this book.

The [official questionnaire](https://www.pns.icict.fiocruz.br/wp-content/uploads/2021/02/Questionario-PNS-2019.pdf) is a lead for variable P036, whose options distinguish a dance class from other exercise. A defensible newer estimate needs the microdata, survey weights and sampling uncertainty. No microdata were processed and no estimate is claimed. That work requires a calculation script, outside this agent's authorized file scope. It is an agent-capable follow-up, not an unreadable-source blocker and not automatically `ready-for-human`.

### Leisure and hobby courses

No national original table of gender composition for in-person hobby classes was found. Searches included IBGE, PNAD education and ABED course reports. Read the extracted text of the [IBGE Education 2023 presentation](https://agenciadenoticias.ibge.gov.br/media/com_mediaibge/arquivos/baf49b4ab43ec70bcba5f01d7f512ffd.pdf), including its vocational-qualification section. Its target is professional education, not hobby-class participation. The [ABED 2024/2025 census](https://www.abed.org.br/site/publicacoes/2486/censoead.br---2024/2025) concerns distance education; it was screened for scope, not read in full or used as evidence about face-to-face social opportunities. Neither source supplies the requested denominator. No fact sheet was created from press statements that women are a majority in generic "cursos livres".

### Federations and another running lead

Targeted searches of CBAt and the São Paulo athletics federation returned competition calendars, rules, administrative reports and race-specific notices rather than a national gender-participation report. This is a search result, not proof that no such report exists. No composition statistic was taken from those materials.

Chronomax's *Estudo sobre Corridas de Rua do Brasil 2023–2025*, <https://estudo.chronomax.com.br/>, is a potentially useful independent commercial comparison based on finish records. The web fetch returned `502 Bad Gateway`; direct `curl -Ls --max-time 40` also failed to save the page. Search snippets and press coverage are insufficient. No fact sheet or statistic was accepted from this lead. A retry or a readable original supplied by a person is needed; the issue comment records the attempted URL and date. The orchestrator can split this lead into a `ready-for-human` follow-up if access remains blocked.

## Implications for existing content

- `tips/convivencia-repetida.md` currently lists running among activities with more men. That historical PNAD statement needs a date and scope qualification before it is presented as current general advice. Ticket Sports' recent commercial figures give a different picture for its events and group purchases. They do not refute the PNAD estimate for its own population and period.
- `studies/ibge-2015-pnad-esporte.md` remains valid as historical survey evidence. Do not replace its running figures with platform inscriptions or call the difference a measured trend: the populations, definitions and denominators differ.
- No Guide or Tip was edited. No course or newer dance percentage should be added on the evidence found here. No source measures finding a romantic partner through these activities.

## Verification and handoff

`pnpm verify studies/ticketsports-2025-perfil-atleta.md` returned `ok`, with **7 of 7 rows verified** against the complete private PDF. `pnpm fmt`, `pnpm build`, and `node scripts/minimal-proof.ts --base origin/main` passed. The minimal proof passed content and frontend types, affected tests, and the changed-file check.

`pnpm check` passed formatting, lint and types, then stopped because the generated README study index lacks the new fact sheet. README is outside this agent's authorized paths. The orchestrator must run `node scripts/study-index.ts`, commit README and rerun the full check when integrating; coverage, fallow and doctor were not reached by this run.

Access attempts and unresolved leads were [posted to issue #51](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/51#issuecomment-6471343413). No item was newly labeled `ready-for-human`; Chronomax is the remaining unreadable lead. The orchestrator owns the README study-index update, the private-source commit and push, any split follow-up issues, and the PR. This branch deliberately changes only its new fact sheet and this report.
