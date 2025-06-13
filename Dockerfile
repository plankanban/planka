FROM node:18-alpine AS server-dependencies

RUN apk -U upgrade \
  && apk add build-base python3 --no-cache

WORKDIR /app

COPY server/package.json server/package-lock.json server/requirements.txt ./

RUN npm install -g pnpm@latest-10 \
  && pnpm install -P

FROM node:lts AS client

WORKDIR /app

COPY client .

RUN npm install -g pnpm@latest-10 \
  && pnpm install -P

RUN DISABLE_ESLINT_PLUGIN=true pnpm run build

FROM node:18-alpine

RUN apk -U upgrade \
  && apk add bash python3 --no-cache \
  && npm install -g pnpm@latest-10

USER node
WORKDIR /app

COPY --chown=node:node server .

RUN wget -qO- https://astral.sh/uv/install.sh | sh \
  && /home/node/.local/bin/uv venv \
  && /home/node/.local/bin/uv pip install -r requirements.txt --no-cache-dir \
  && mv .env.sample .env \
  && pnpm config set update-notifier false

COPY --from=server-dependencies --chown=node:node /app/node_modules node_modules

COPY --from=client --chown=node:node /app/dist public
COPY --from=client --chown=node:node /app/dist/index.html views

VOLUME /app/public/favicons
VOLUME /app/public/user-avatars
VOLUME /app/public/background-images
VOLUME /app/private/attachments

EXPOSE 1337

HEALTHCHECK --interval=10s --timeout=2s --start-period=15s \
  CMD node ./healthcheck.js

CMD ["./start.sh"]
