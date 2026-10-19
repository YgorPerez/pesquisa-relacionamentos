# O código do Effect fica em `.repos/` para os agentes lerem

O `packages/conteudo` valida o frontmatter com o Schema do `effect@4.0.2`. A API da v4 mudou nomes e módulos da v3, e quase tudo que o agente leu sobre Effect é v3 ou um release candidate da v4. De memória, ele escreve uma função que não existe, ou que existe com outro comportamento. Copiado do [ADR-0039 do Festival dos Macacos](https://github.com/Escala-as-Dores/festival-macacos/blob/main/docs/adr/0039-the-effect-source-sits-in-repos-for-agents-to-read.md), que copiou do t3code.

## Decisão

- **`node scripts/sincronizar-referencias.ts` clona o repositório do Effect em `.repos/effect-smol`**, na tag `effect@<versão>` do `catalog:` do `pnpm-workspace.yaml`: um clone raso de uma tag, uns 60 MB. Não faz nada se o clone já está nela, e clona de novo quando a versão muda.
- **`.repos/` fica no `.gitignore`**, fora do formato e do lint.
- **O `scripts/preparar-worktree.ts` sincroniza a partir da cópia do principal** (`--de`), sem baixar do GitHub.
- **Ler, nunca importar nem editar.** A entrada é `.repos/effect-smol/LLMS.md`; o fonte de um módulo está em `packages/effect/src/`. O `AGENTS.md` diz isso em "Código do Effect".

## Consequências

- Subir o `effect` no catálogo pede rodar o script de novo; o preparo de um worktree já roda.
- Sem rede e sem cópia no principal, o preparo avisa e segue sem `.repos/`.
