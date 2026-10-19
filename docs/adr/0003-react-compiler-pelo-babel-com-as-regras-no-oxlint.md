# React Compiler pelo Babel, com as regras no Oxlint

O React Compiler memoiza cada componente e hook no build, como no Festival. O `@vitejs/plugin-react` 6 não traz mais o Babel, e o compilador estável ainda é um plugin do Babel, então ele roda pelo `@rolldown/plugin-babel` com o `reactCompilerPreset()`, no build do app e no Vite do Storybook. O preset pula o SSR. O Vitest roda sem o compilador, e o comportamento compilado fica com as stories e com o e2e, que roda o build.

O Oxlint também tem uma versão do compilador em Rust, ligada por `react({ compiler: true })` com o `oxc-transform-react`. Ficou de fora: a documentação dele ainda a chama de experimental.

## Consequências

- O `lint` liga as 22 regras do React Compiler: as 12 que a categoria `correctness` já liga e as outras dez uma a uma, mais `react/rules-of-hooks` e `react/exhaustive-deps`. Elas acharam dez pontos no código que existia, e todos foram corrigidos sem supressão: `setState` em efeito virou ajuste durante o render ou `useSyncExternalStore`, ref lida no render virou estado, e uma dependência que faltava virou `useEffectEvent`.
- Uma tela que o compilador quebrar sai dele com `'use no memo'` no topo, e a linha leva o motivo.
