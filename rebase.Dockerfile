FROM node:18-bookworm as base
RUN apt-get update && \
    apt-get install -y tini && \
    npm install pnpm --global

FROM base as server-dependencies
WORKDIR /planka/server
COPY server .
RUN pnpm install --frozen-lockfile --prod

FROM base as client
WORKDIR /planka/client
COPY client .
RUN pnpm install --frozen-lockfile --prod
RUN DISABLE_ESLINT_PLUGIN=true pnpm run build

FROM base AS intermediate
WORKDIR /app
COPY --from=server-dependencies /planka/server .
COPY --from=client /planka/client/build public
COPY --from=client /planka/client/build/index.html views/index.ejs
COPY docker-entrypoint.sh .
RUN mv .env.sample .env

FROM node:18-bookworm-slim AS final

ARG USER=planka

RUN useradd --no-create-home --shell /bin/bash $USER

USER $USER

WORKDIR /app

COPY --from=intermediate --chown=$USER:$USER /usr/bin/tini /usr/local/bin/tini
COPY --from=intermediate --chown=$USER:$USER /app .

VOLUME /app/public/user-avatars
VOLUME /app/public/project-background-images
VOLUME /app/private/attachments

EXPOSE 1337/tcp

# Use Tini to start Planka and shutdown gracefully:
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
ENTRYPOINT ["tini", "--"]

CMD ["./docker-entrypoint.sh"]