# O pre-push roda a auditoria e só os testes afetados

Um push que quebra um teste só aparece no CI, minutos depois, e outro agente pode já ter feito merge do ramo. Rodar a suíte inteira a cada push seria o custo que o ADR 0016 tirou. Do `verificar-push.ts` do Festival dos Macacos (#1054 dele), sem o certificado.

## Decisão

- **`.githooks/pre-push` roda `node scripts/verificar-push.ts`**, e o `preparar-worktree.ts` liga o hook com `scripts/instalar-hooks.ts` (`core.hooksPath = .githooks`, comum a todas as worktrees). O hook de uma worktree passa a vez ao da worktree que faz o push.
- **Cada ref do push passa pela auditoria das supressões** (ADR 0017) contra o destino: o ramo do remoto de que o commit está mais perto, a `main` ou um `spec/*`.
- **E pelo Vitest só das pastas que o push afeta** (`afetados.ts`), com `--changed`: no primeiro push do ramo, desde o merge-base com o destino; nos seguintes, desde o que o remoto já tinha. Sem e2e, sem stories.
- **A `main` só anda para a frente**, e apagá-la não passa.
- **`SEM_TESTES="<motivo>" git push`** pula os testes, não a auditoria, e anota o motivo em `<git-common-dir>/push-sem-testes.log`.

## Consequências

- O hook é do cliente: `git push --no-verify` o pula, e o servidor não confere nada. Ele segura o engano, não quem quer passar.
- Um push só de documentação não roda teste nenhum.
