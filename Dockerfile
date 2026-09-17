# Stage 1: Server build
FROM node:24-alpine AS server

RUN apk -U upgrade \
  && apk add build-base python3 --no-cache

WORKDIR /app

COPY server .

RUN  npm install \
  && npm run build \
  && npm prune --production

# Stage 2: Client build
FROM node:24 AS client

WORKDIR /app

COPY client .
COPY CHANGELOG.md /CHANGELOG.md

RUN npm install npm --global \
  && npm install --omit=dev \
  && INDEX_FORMAT=ejs DISABLE_ESLINT_PLUGIN=true npm run build

# Stage 3: Final image
FROM node:24-alpine

RUN apk -U upgrade \
  && apk add bash python3 squid --no-cache

USER node
WORKDIR /app

COPY --chown=node:node LICENSE.md .
COPY --chown=node:node ["LICENSES/PLANKA Community License DE.md", "LICENSE_DE.md"]

COPY --from=server --chown=node:node /app/node_modules node_modules
COPY --from=server --chown=node:node /app/dist .

COPY --from=client --chown=node:node /app/dist public

RUN python3 -m venv .venv \
  && .venv/bin/pip3 install --upgrade pip \
  && .venv/bin/pip3 install -r requirements.txt --no-cache-dir \
  && mv .env.sample .env \
  && mv public/index.ejs views \
  && npm config set update-notifier false

# Everything above is owned by uid 1000, and the app has to create its log and
# temporary directories at runtime. Group 0 is what Docker gives a bare
# `user: <uid>`, so handing these directories to it is what lets any other uid
# start. The data volume inherits this too when it is created.
USER root

RUN mkdir -p logs .tmp data \
  && chown node:0 logs .tmp data \
  && chgrp 0 /app \
  && chmod g+rwx /app logs .tmp data

USER node

VOLUME /app/data
EXPOSE 1337

HEALTHCHECK --interval=10s --timeout=2s --start-period=15s \
  CMD node ./healthcheck.js

CMD ["./start.sh"]
