# Preview remoto

Para mostrar um protótipo a quem está longe da máquina (no celular, pelo T3 Code), publique a pasta num link https temporário:

```bash
scripts/remote-preview.sh                 # serve prototypes/ na porta 8765
scripts/remote-preview.sh relatorios 8766 # outra pasta, outra porta
scripts/remote-preview.sh stop
```

O script imprime um link `https://<quatro-palavras>.trycloudflare.com/<arquivo>.html` para cada HTML da pasta e devolve o terminal. O servidor e o túnel continuam rodando em segundo plano até o `stop`, até a máquina reiniciar ou até a próxima chamada, que derruba os anteriores antes de subir os novos. O último link fica em `/tmp/remote-preview/url`, e os logs ficam ao lado.

## Como funciona

- Um `python3 -m http.server` serve só a pasta pedida, escutando em `127.0.0.1`.
- Um [Cloudflare Quick Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/) (`cloudflared tunnel --url`) liga esse servidor a um subdomínio aleatório de `trycloudflare.com`. Não precisa de conta nem de porta aberta no roteador.
- Se o `cloudflared` não estiver no PATH, o script baixa o binário oficial das releases do GitHub para `~/.local/bin/cloudflared`.

## Cuidados

- **O link é público.** Quem tiver a URL vê a pasta inteira, com listagem de arquivos. Sirva só pastas sem nada privado (`prototypes/` serve), e pare o túnel quando terminar.
- **O link muda a cada chamada.** O Quick Tunnel não tem endereço fixo. Mande o link novo a cada rodada.
- O Quick Tunnel é para teste: não tem garantia de uptime e limita as requisições simultâneas. Não serve para publicar o site.

## Quando o agente usa

Quando o preview embutido do harness não abre (no T3 Code, por exemplo, o AppArmor do Ubuntu 23.10+ bloqueia o navegador) ou quando o usuário avisa que está no celular, rode o script e entregue o link na resposta.
