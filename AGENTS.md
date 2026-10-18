# pesquisa-relacionamentos

## Issue tracker

GitHub Issues em `YgorPerez/pesquisa-relacionamentos`, via `gh`. **Use sempre a conta YgorPerez**, nunca ygor-infotera:

```bash
export GH_TOKEN=$(gh auth token --user YgorPerez)
```

O `git push`/`fetch` deste repo já está fixado na conta YgorPerez (credential helper local).

### Wayfinding

- **Mapa:** issue com o label `wayfinder:map` ("Mapa: MVP do site de evidências sobre relacionamentos").
- **Tickets:** sub-issues do mapa (`gh issue create --parent <mapa>`), com o label `wayfinder:<research|prototype|grilling|task>`.
- **Bloqueio:** dependências nativas do GitHub: `gh api --method POST repos/YgorPerez/pesquisa-relacionamentos/issues/<filho>/dependencies/blocked_by -F issue_id=<database id do bloqueador>` (database id: `gh api repos/YgorPerez/pesquisa-relacionamentos/issues/<n> --jq .id`).
- **Fronteira:** `gh api repos/YgorPerez/pesquisa-relacionamentos/issues/<mapa>/sub_issues --jq '.[] | select(.state=="open" and .issue_dependencies_summary.blocked_by==0 and (.assignees|length)==0) | "#\(.number) \(.title)"'`

## Domínio

Vocabulário em `GLOSSARY.md`. Convenções de Fichas (Status de verificação, Força da evidência, nomes de arquivo) no `README.md`.
