# Apps, dating sites and social networks: follow-up for issue #50

Search date: 2026-10-28. Branch: `acervo/50-apps-vs-sites-2`. Potarca 2020 was already merged in PR #90 and was not edited. Existing DOIs and file names in `studies/` were checked before adding a sheet.

## Delivered study

[Hall 2014](../studies/hall-2014-redes-sociais-casamento.md) is verified, with weak evidence. It reuses the commercial Harris/eHarmony survey behind Cacioppo 2013, with exclusions leaving 18,527 respondents. It distinguishes social networks, dating sites, individual online communication and online communities. Satisfaction did not differ detectably between social-network and dating-site marriages. The adjusted separation/divorce comparison groups all other online venues together. It does not measure swipe apps or prospective relationship duration.

The full author-uploaded article was read through the ResearchGate page, including methods, results, Table 1, discussion, acknowledgments and financial disclosure. The local source preserves the extracted text, rather than pretending to be a downloaded PDF. Figure 1 is not preserved and is not used in the sheet. This resolves the earlier inability to read Hall; no human access request is needed for the claims delivered here.

## Search and screening after 2020

This was a targeted follow-up, not a systematic review. Queries combined dating apps, dating websites/sites, social networking/social media, relationship quality/satisfaction, marital stability, breakup and duration, with publication years from 2021 onward. Searches also targeted PMC and OSF. Open-copy resolution for DOIs used `scripts/fetch-sources.py` (Unpaywall, OpenAlex and Semantic Scholar). Institutional and author copies were checked separately where found.

- **Sharabi & Dorrance-Hall 2024, DOI 10.1016/j.chb.2023.107973:** an important correction to the earlier screening. The author-uploaded [ResearchGate full text](https://www.researchgate.net/publication/374134668_The_Online_Dating_Effect_Where_a_Couple_Meets_Predicts_the_Quality_of_Their_Marriage), section 4.3, p. 6, includes an ancillary comparison of mobile apps with dating websites. Satisfaction was not significantly associated with app meeting (b = −0.13, p = .06), while self-reported marital stability was lower (b = −0.26, p < .01). Section 3.2.6 defines stability through thoughts or discussion of divorce, not observed divorces. This is a lead for the owner of the existing `studies/sharabi-2024-online-dating-effect.md`, not a new sheet or a verified update here: only the relevant sections were checked. The source script found no downloadable open PDF. The author upload became available in June 2025. Do not describe Potarca as the only study separating app and site outcomes without checking this analysis. Neither study ranks individual swipe apps.
- **Langlais, Toohey & Podberesky 2024, DOI 10.3390/socsci13100541:** the PDF previously blocked by MDPI now downloaded through the source script. Full text read. Its response categories are dating application, in person and other; it does not retain dating sites or social networks as separate comparison groups. Excluded from new sheets for this issue. It also omits relationship length and has small app groups despite a contradictory power statement in its methods. It cannot answer the app-versus-site question.
- **Bleize, van Stekelenburg & Tamboer 2024, DOI 10.1177/20501579231221069:** [publisher page](https://journals.sagepub.com/doi/10.1177/20501579231221069) screens as app users versus never-users and satisfaction with relationship status, rather than relationship quality by meeting venue. No open PDF returned by the script. Excluded at screening; no sheet based on an abstract.
- **Adamczyk, Janowicz & Mrozowicz-Wrońska 2024, online 2022, DOI 10.1177/14614448221097894:** [publisher page](https://journals.sagepub.com/doi/10.1177/14614448221097894) describes qualitative experiences of never-married single adults. It distinguishes technologies conceptually but does not supply the required comparison of couple quality or duration. No open PDF returned by the script. Excluded at screening.
- **Qian and colleagues 2025, DOI 10.1111/jomf.12967:** the [full publisher page](https://onlinelibrary.wiley.com/doi/full/10.1111/jomf.12967) says its Canadian online category could not be disaggregated; the outcome is assortative mating. Excluded.
- **Tian 2026, DOI 10.1080/1369118X.2026.2729550:** the [publisher methods](https://www.tandfonline.com/doi/full/10.1080/1369118X.2026.2729550) distinguish online dating from other online settings, but not swipe apps from sites; the outcomes are assortative mating. Excluded.
- Potarca 2021, Kowal 2025, Cacioppo 2013 and Sharabi 2024 already have sheets. No duplicate was created. No additional eligible study separating all three venues on couple quality or duration was established in this search. That is a search result, not proof none exists.

## Local sources for the orchestrator

Do not commit the shared private repository concurrently with other agents.

- **Required:** `sources/private/hall-2014-redes-sociais-casamento.txt`. Origin: [author-uploaded ResearchGate article](https://www.researchgate.net/publication/260680968_First_Comes_Social_Networking_Then_Comes_Marriage_Characteristics_of_Americans_Married_2005-2012_Who_Met_Through_Social_Networking_Sites). This is the web tool's article-text extraction, with line labels removed, not a manually reconstructed article. Provenance and the missing figure are recorded in the file. No open redistribution license was established; keep private.
- **Screened out; not required by the sheet:** `sources/private/langlais-2024-apps-relacionamentos.pdf`. Origin: https://www.mdpi.com/2076-0760/13/10/541/pdf?version=1728720123. The article declares CC BY 4.0. Left in the private source directory because this agent owns only new sheets and this report; it can be omitted from the private-source commit or retained for a separately scoped follow-up.

Hall download attempts: the supplied [KU API PDF](https://kuscholarworks.ku.edu/server/api/core/bitstreams/e834b1d5-2764-4f8a-836e-7ecc6bf9140f/content) and query variants returned HTTP 403; the KU `/bitstreams/.../download` route returned a login page. The [institutional record](https://kuscholarworks.ku.edu/handle/1808/16399) still points to that bitstream. The publisher PDF and ResearchGate PDF download were also blocked. OCR tools were installed successfully, but there was no valid PDF to OCR. The author-page text provided an alternative readable source.

## Implications and handoff

- Update the existing Sharabi sheet through its owner after a full-text reading and local-source capture. Its ancillary analysis is directly relevant to #50; the current sheet omits it.
- Hall adds a distinction to `studies/cacioppo-2013-satisfacao-por-local.md`, but is not independent evidence. Do not count the two as replications.
- The reports `2026-10-18-onde-casais-se-conhecem.md` and `2026-10-25-vale-a-pena-apps-de-namoro.md` can incorporate the distinctions after the source is integrated and reviewed. Hall cannot establish current app outcomes.
- No direct change to a Dica or Guia follows from Hall. In particular, it does not strengthen a causal recommendation to prefer sites, apps or social networks. No files in `tips/` or Guides were edited.
- No study newly marked `ready-for-human`: Hall's textual claims are readable, the other unread items were excluded at screening or already have an owner. The publisher PDFs' access limitations should not be mistaken for unreadable author-page text.
- The orchestrator must commit/push the required private source, regenerate the README study index and open the PR. The README was left untouched under the assigned file ownership.

## Verification

`pnpm verify studies/hall-2014-redes-sociais-casamento.md`:

```text
ok    studies/hall-2014-redes-sociais-casamento.md (sources/private/hall-2014-redes-sociais-casamento.txt): 3 of 3 rows verified
```

`pnpm build` passed with the real library. `pnpm fmt` and `node scripts/minimal-proof.ts --base origin/main` passed (content/frontend types, affected tests and changed-file check). `pnpm check` passed formatting, lint and types, then failed at the stale README study index; later commands in that chain did not run. Regenerating the index is reserved for the orchestrator under the assigned file ownership. No PR was opened and no private-source commit was made by this agent.

Access attempts and screening results were [commented on issue #50](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/50#issuecomment-6471422236). The issue was left open for integration.
