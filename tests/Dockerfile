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

COPY package.json package-lock.json tsconfig.json .pnp* ./
COPY tests ./tests
COPY tests/run-tests.sh /
COPY common ./common

RUN chmod +x /run-tests.sh

RUN npm install

WORKDIR /test-app/tests


ENTRYPOINT ["/run-tests.sh"]
