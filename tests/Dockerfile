# syntax=docker/dockerfile:1
ARG ALPINE_VERSION=3.23
ARG NODE_VERSION=24


FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS builder

WORKDIR /build-app
# Copy the .npmrc file that will be created by the GitHub Action
COPY .npmrc ./

COPY package.json package-lock.json tsconfig.json ./
RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
    NODE_AUTH_TOKEN=$(cat /run/secrets/NODE_AUTH_TOKEN) \
    npm ci --progress=plain --no-cache

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS run-tests

RUN apk update && \
      apk upgrade && \
      apk add --no-cache \
      bash \
      aws-cli \
      mandoc \
      curl

WORKDIR /test-app

COPY --from=builder /build-app/node_modules ./node_modules
COPY .npmrc package.json package-lock.json tsconfig.json .pnp* ./
COPY --chown=node:node tests ./tests
COPY tests/run-tests.sh /
COPY common ./common

RUN chmod +x /run-tests.sh

WORKDIR /test-app/tests

ENTRYPOINT ["/run-tests.sh"]
