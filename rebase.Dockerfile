FROM node:18-bookworm as base
RUN apt-get update \
    && apt-get install -y \
    tini && \
    npm install pnpm --global
WORKDIR /app

FROM base as server-dependencies
COPY server/pnpm-lock.yaml .
RUN pnpm fetch --prod
RUN pnpm install -r --offline --prod

FROM base as client
COPY client/pnpm-lock.yaml .
RUN pnpm fetch --prod
COPY client .
RUN pnpm install -r --offline --prod
RUN DISABLE_ESLINT_PLUGIN=true pnpm run build

FROM base AS intermediate

WORKDIR /app

COPY --from=server-dependencies /app/node_modules node_modules
COPY --from=server-dependencies /usr/bin/tini /usr/local/bin/tini

COPY --from=client /app/build public
COPY --from=client /app/build/index.html views/index.ejs

COPY docker-entrypoint.sh .
COPY server .

RUN mv .env.sample .env

FROM node:18-bookworm-slim AS final

ARG USER=planka

RUN useradd --no-create-home --shell /bin/bash $USER

USER $USER

WORKDIR /app

COPY --from=server-dependencies --chown=$USER:$USER /usr/bin/tini /usr/local/bin/tini
COPY --from=intermediate --chown=$USER:$USER /app .

VOLUME /app/public/user-avatars
VOLUME /app/public/project-background-images
VOLUME /app/private/attachments

EXPOSE 1337/tcp

# Use Tini to start Planka and shutdown gracefully:
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
ENTRYPOINT ["tini", "--"]

CMD ["./docker-entrypoint.sh"]