FROM node:alpine AS server-builder

WORKDIR /app

RUN apk add vips-dev fftw-dev build-base python --no-cache \
    --repository https://alpine.global.ssl.fastly.net/alpine/v3.10/community/ \
    --repository https://alpine.global.ssl.fastly.net/alpine/v3.10/main/

COPY server/package.json server/package-lock.json ./

RUN npm i --prod --silent

FROM node:alpine AS client-builder

WORKDIR /app

COPY client/package.json client/package-lock.json ./

RUN npm i --silent

COPY client .

RUN npm run build

FROM node:alpine

RUN apk add bash vips --no-cache \
    --repository https://alpine.global.ssl.fastly.net/alpine/v3.10/community/

WORKDIR /app

COPY --from=server-builder /app/node_modules node_modules
COPY server .
COPY --from=client-builder /app/build public
COPY --from=client-builder /app/build/index.html views

ENV BASE_URL DATABASE_URL

VOLUME /app/public/uploads

EXPOSE 1337

CMD ["npm", "start"]
