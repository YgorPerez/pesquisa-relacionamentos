# O servidor SSR do TanStack Start, no molde do Festival dos Macacos. A imagem
# só leva o `.output/` do build, e o contexto do `docker build` é ele: o nitro
# já empacota em `.output/server/node_modules` o que o servidor importa, e não
# há `pnpm install` aqui dentro. O app não tem pacote nativo, então a imagem é
# alpine.
#
# Quem monta a imagem é o deploy, na própria VPS (`scripts/vps.ts`), com o SHA
# do commit no nome. Para montar e rodar aqui:
#
#   pnpm build
#   docker build -f Dockerfile -t temestudo-app .output
#   docker run --rm -p 127.0.0.1:4311:3000 temestudo-app
FROM node:24-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    TZ=America/Sao_Paulo

WORKDIR /app

# `--link`: a camada não depende das de baixo, e um deploy que só troca o
# código não baixa a imagem do Node de novo.
COPY --link server ./server
COPY --link public ./public
COPY --link nitro.json ./

USER node

# Documenta o padrão. O `-p` do `docker run` escolhe a porta de fora, a do
# par que o Nginx não está usando (`scripts/vps.ts`).
EXPOSE 3000

# Cada pedido sai no stdout como `GET /caminho 200 12ms`, sem a query
# (`src/platform/registro-do-pedido.ts`), e é isso que o `docker logs` mostra.
CMD ["node", "server/index.mjs"]
