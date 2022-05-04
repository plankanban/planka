FROM node:lts AS client-builder

WORKDIR /app

COPY client/package.json client/package-lock.json ./

RUN npm install npm@latest --global \
  && npm install

COPY client .
RUN npm run build

FROM ghcr.io/plankanban/planka:base-latest

WORKDIR /app

COPY server/.npmrc server/package.json server/package-lock.json ./

RUN npm install npm@latest --global \
  && npm install --production

COPY docker-start.sh start.sh
COPY server .

RUN cp .env.sample .env

COPY --from=client-builder /app/build public
COPY --from=client-builder /app/build/index.html views

VOLUME /app/public/user-avatars
VOLUME /app/public/project-background-images
VOLUME /app/private/attachments

EXPOSE 1337

CMD ["./start.sh"]
