# Os controles são Base UI, vestidos pelos componentes do shadcn

Como no Festival dos Macacos (`frontend/components.json` com o estilo `base-nova`), os controles do site são primitivos do Base UI, trazidos pelo CLI do shadcn para `frontend/src/ui/shadcn/` e redesenhados com os tokens do DESIGN.md: `Button` (o `Botao`, `principal` e `leve`, e a forma `seta` do link com cara de botão), `Toggle` (os chips do topo 3), `RadioGroup` (as opções do Perfil, o seletor de desfecho e as opções do Grupo possível), `Checkbox`, `Switch` (a chave de não ser contado), `Input` e `Collapsible` (as dobras). Os passos do Grupo possível são o `NumberField` do Base UI direto, que o shadcn não traz. O Base UI cuida do teclado, do foco e do ARIA; o e2e de acessibilidade (axe) continua passando.

Os aliases são os do Festival: `@/ui`, `@/ui/shadcn` e `@/platform/cn`. O `cn` é o do pacote `cn`, com as tabelas geradas do `@theme` (`pnpm cn:tables`, conferidas pelo `cn.test.ts`), para ele saber que `text-label` é tamanho e não cor.

## Consequências

- O que veio do `base-nova` foi trocado pelo desenho do site; o arquivo do CLI é só o ponto de partida. Um componente novo do shadcn passa pelo mesmo redesenho antes de entrar.
- Os ícones do site são desenhados à mão (DESIGN.md, Shapes): o `lucide-react` não entra, e a `cohesion/hand-drawn-icons` recusa o import. O `iconLibrary` do `components.json` fica `lucide` porque o CLI pede um.
- Os testes acham as peças pelo papel ou pelo `data-slot` (`[data-slot="selo-voce"]`), como no shadcn, e não por classe.
