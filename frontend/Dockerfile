# The TanStack Start SSR server, modeled on the Festival dos Macacos. The image
# only carries the build's `.output/`, and the `docker build` context is it:
# nitro already bundles into `.output/server/node_modules` what the server
# imports, and there is no `pnpm install` in here. The app has no native
# package, so the image is alpine.
#
# The deploy builds the image, on the VPS itself (`scripts/vps.ts`), with the
# commit SHA in the name. To build and run it here:
#
#   pnpm build
#   cp scripts/database-maintenance.ts .output/
#   cp src/platform/database.ts .output/
#   docker build -f Dockerfile -t temestudo-app .output
#   docker run --rm -v temestudo-data:/data -p 127.0.0.1:4311:3000 temestudo-app
FROM node:24-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    TZ=America/Sao_Paulo

WORKDIR /app

# `--link`: the layer does not depend on the ones below, and a deploy that only
# changes the code does not download the Node image again.
COPY --link server ./server
COPY --link public ./public
COPY --link nitro.json ./
COPY --link database.ts ./src/platform/database.ts
COPY --link database-maintenance.ts ./scripts/database-maintenance.ts

# Docker initializes a new named volume from this directory, with this owner.
RUN mkdir /data && chown node:node /data && chmod 700 /data

USER node

# Documents the default. `docker run`'s `-p` picks the outside port, the one of
# the pair Nginx is not using (`scripts/vps.ts`).
EXPOSE 3000

# Each request goes to stdout as `GET /path 200 12ms`, without the query
# (`src/platform/request-log.ts`), and that is what `docker logs` shows.
CMD ["sh", "-c", "node scripts/database-maintenance.ts init /data/app.sqlite && exec node server/index.mjs"]
