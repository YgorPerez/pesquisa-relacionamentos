# As skills do Matt Pocock ficam vendorizadas para o Codex

O Claude Code instala as skills do [`mattpocock/skills`](https://github.com/mattpocock/skills) como plugin (`.claude/settings.json`). O Codex e os outros harnesses não leem plugin do Claude Code, e um agente do Codex trabalhava aqui sem `tdd`, `code-review` ou `grilling`. O Festival dos Macacos resolveu isso com uma cópia em `.agents/skills/` e o `skills-lock.json`, gerenciados pelo CLI [`skills`](https://skills.sh).

## Decisão

- **`.agents/skills/` tem as 27 skills de `engineering` e `productivity`, e o `skills-lock.json` o hash de cada uma.** É a mesma versão do Festival (`main` @ `6fd9479`, de 06/10/2026), com as mesmas edições locais em `grilling` e `handoff` (`.agents/skills/NOTICE.md`).
- **Ninguém edita as skills à mão:** `npx skills update` sobrescreve. O que é deste repositório vai para `AGENTS.md` e `docs/agents/`, que as skills leem.
- **O impeccable fica fora do lock e do git.** Ele instala com o comando dele (`docs/agents/design.md`), e o `prepare-worktree.ts` liga a cópia do principal.
- **`.claude/skills/grilling` continua a cópia editada para o Claude Code**, igual à de `.agents/skills/grilling`. As duas mudam juntas.

## Consequências

- `.agents/` e `skills-lock.json` ficam fora do formato e do lint, como as outras skills de terceiros.
- Uma atualização do upstream é um commit só com `npx skills update` e a revisão do diff de `grilling` e `handoff`.
