# React Compiler through Babel, with the rules in Oxlint

The React Compiler memoizes each component and hook at build time, as in the Festival. `@vitejs/plugin-react` 6 no longer ships Babel, and the stable compiler is still a Babel plugin, so it runs through `@rolldown/plugin-babel` with `reactCompilerPreset()`, in the app build and in Storybook's Vite. The preset skips SSR. Vitest runs without the compiler, and compiled behavior is covered by the stories and by e2e, which runs the build.

Oxlint also has a Rust version of the compiler, turned on by `react({ compiler: true })` with `oxc-transform-react`. It was left out: its documentation still calls it experimental.

## Consequences

- `lint` turns on the 22 React Compiler rules: the 12 that the `correctness` category already turns on and the other ten one by one, plus `react/rules-of-hooks` and `react/exhaustive-deps`. They found ten spots in the existing code, and all were fixed without suppression: `setState` in an effect became an adjustment during render or `useSyncExternalStore`, a ref read during render became state, and a missing dependency became `useEffectEvent`.
- Lint does not catch everything. The Possible group calculation read the packs' `Map` directly during render, and the compiler kept the first value, empty: the page stayed loading forever, and only e2e saw it. State from outside React reaches render through `useSyncExternalStore`, with the value as the snapshot.
- A screen the compiler breaks opts out with `'use no memo'` at the top, and the line carries the reason.
