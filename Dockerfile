# Stage 1: Server build
FROM node:22-alpine AS server

RUN apk -U upgrade \
  && apk add build-base python3 --no-cache

WORKDIR /app

COPY server .

RUN npm install npm --global \
  && npm install \
  && npm run build \
  && npm prune --production

# Stage 2: Client build
FROM node:22 AS client

WORKDIR /app

COPY client .

RUN npm install npm --global \
  && npm install --omit=dev \
  && DISABLE_ESLINT_PLUGIN=true npm run build

# Stage 3: Final image
FROM node:22-alpine

RUN apk -U upgrade \
  && apk add bash python3 --no-cache \
  && npm install npm --global

USER node
WORKDIR /app

COPY --chown=node:node LICENSE.md .
COPY --chown=node:node ["LICENSES/PLANKA Community License DE.md", "LICENSE_DE.md"]

COPY --from=server --chown=node:node /app/node_modules node_modules
COPY --from=server --chown=node:node /app/dist .

COPY --from=client --chown=node:node /app/dist public
COPY --from=client --chown=node:node /app/dist/index.html views

RUN python3 -m venv .venv \
  && .venv/bin/pip3 install --upgrade pip \
  && .venv/bin/pip3 install -r requirements.txt --no-cache-dir \
  && mv .env.sample .env \
  && npm config set update-notifier false

VOLUME /app/data
EXPOSE 1337

HEALTHCHECK --interval=10s --timeout=2s --start-period=15s \
  CMD node ./healthcheck.js

CMD ["./start.sh"]
