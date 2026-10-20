# O deploy confere os assets de fora

O Festival teve o site no ar apontando para um bundle apagado: o HTML citava `assets/index-*.js` e o servidor respondia a página de erro, em HTML, com status 200. Desde então o deploy de lá confere de fora (`conferir-no-ar.ts`) que o bundle chega como JavaScript.

Aqui o último passo do `publicar` e do `voltar` no `deploy.yml` roda `node scripts/check-live.ts temestudo.cloud <sha>`. Pela internet, ele confere:

- que `https://temestudo.cloud/?conferencia=<sha>` responde 200 com `Referrer-Policy: strict-origin`;
- que cada `/assets/*.js` e `/assets/*.css` citado na página responde 200 com o tipo dele (`javascript`, `text/css`), e não com HTML;
- que `http://temestudo.cloud/?x=1` leva a `https://temestudo.cloud/?x=1`.

Ele tenta de novo a cada 5 s, por até 60 s, porque o contêiner acabou de trocar. Se não passa, o job falha com o motivo.

## Consequências

- A conferência de antes, com `curl` no workflow, só via o cabeçalho e a redireção. Ela está contida nesta.
- A página precisa citar pelo menos um `/assets/*.js`. Uma página de domínio estacionado, ou o build sem bundle, falha.
- O `content-type` dos assets vem do Nitro, que serve o `public/` pelo Node. Se o Nginx passar a servir os assets do disco, a conferência segue valendo sem mudança.
