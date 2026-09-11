# syntax=docker/dockerfile:1
ARG ALPINE_VERSION=3.23
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS run-tests

RUN apk update && \
      apk upgrade && \
      apk add --no-cache \
      bash \
      aws-cli \
      mandoc \
      curl

WORKDIR /test-app

COPY .npmrc package.json package-lock.json tsconfig.json .pnp* ./
COPY tests ./tests
COPY tests/run-tests.sh /
COPY common ./common

RUN chmod +x /run-tests.sh

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    NODE_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN) \
    npm install

RUN rm -f .npmrc

WORKDIR /test-app/tests


ENTRYPOINT ["/run-tests.sh"]
