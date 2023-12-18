# Step 1: server-dependencies
FROM node:18-bookworm as server-dependencies

RUN apt-get update \
    && apt-get install -y \
    tini

WORKDIR /app

COPY server/package.json server/package-lock.json ./
COPY server/pnpm-lock.yaml .

RUN npm install pnpm --global && \
    pnpm install --prod

# Step 2: client
FROM node:18-bookworm AS client

WORKDIR /app

COPY client/package.json client/package-lock.json ./
COPY client .

RUN npm install pnpm --global && \
    pnpm install --prod

RUN DISABLE_ESLINT_PLUGIN=true npm run build

# Step 3: intermediate
FROM node:18-bookworm-slim AS intermediate

WORKDIR /app

COPY --from=server-dependencies /app/node_modules node_modules
COPY --from=server-dependencies /usr/bin/tini /usr/local/bin/tini

COPY --from=client /app/build public
COPY --from=client /app/build/index.html views/index.ejs

COPY start.sh .
COPY server .

RUN mv .env.sample .env

# Step 4: final
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

CMD ["./start.sh"]
