FROM node:18-bookworm as server-dependencies

RUN apt-get update \
    && apt-get install -y \
    tini

WORKDIR /app

COPY server/package.json server/package-lock.json ./

RUN npm install npm@latest --global \
  && npm install pnpm --global \
  && pnpm import \
  && pnpm install --prod

FROM node:18-bookworm AS client

WORKDIR /app

COPY client/package.json client/package-lock.json ./

RUN npm install npm@latest --global \
  && npm install pnpm --global \
  && pnpm import \
  && pnpm install --prod

COPY client .
RUN DISABLE_ESLINT_PLUGIN=true npm run build

FROM node:18-bookworm-slim AS final

ARG USER=planka
RUN useradd --no-create-home --shell /bin/bash $USER
USER $USER

WORKDIR /app

COPY --chown=$USER:$USER start.sh .
COPY --chown=$USER:$USER server .

RUN mv .env.sample .env

COPY --from=server-dependencies --chown=$USER:$USER /app/node_modules node_modules
COPY --from=server-dependencies --chown=$USER:$USER /usr/bin/tini /usr/local/bin/tini

COPY --from=client --chown=$USER:$USER /app/build public
COPY --from=client --chown=$USER:$USER /app/build/index.html views/index.ejs

VOLUME /app/public/user-avatars
VOLUME /app/public/project-background-images
VOLUME /app/private/attachments

EXPOSE 1337

# Use Tini to start Planka and shutdown gracefully:
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
ENTRYPOINT ["tini", "--"]

CMD ["./start.sh"]
