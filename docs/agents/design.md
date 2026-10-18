# Design e texto

Duas skills vieram do Festival dos Macacos.

## impeccable

A skill de design do [pbakaus/impeccable](https://github.com/pbakaus/impeccable) faz crítica, auditoria, polimento, adaptação ao celular e sistema de design de interface. Use em qualquer tela: protótipo, componente ou página do site.

Ela não fica versionada: são 23 MB, com um binário de uma plataforma só. Em cada clone ou worktree, instale com:

```bash
npx impeccable install --project --providers=claude,codex -y
```

O comando gera `.claude/skills/impeccable/`, `.claude/agents/impeccable-*`, `.agents/skills/impeccable/` e `.codex/hooks.json`, todos no `.gitignore`. O gancho do Claude Code vai para `.claude/settings.local.json`: ele roda o detector de anti-padrões depois de cada Edit/Write num arquivo de UI e faz uma passada completa no fim do turno.

Para atualizar, use `npx impeccable update`. O contrato de design (`PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, criados por `/impeccable init`) é versionado quando existir. As rodadas de crítica em `.impeccable/` não são.

## unslop

`.claude/skills/unslop/` corta os vícios de texto de IA, em português e em inglês. Vale para toda prosa escrita aqui: Ficha, ticket, comentário, commit e texto do site. É uma cópia da skill do Festival e não depende de nenhum instalador.
