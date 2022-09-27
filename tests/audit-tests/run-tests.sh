#!/usr/bin/env bash

set -eu

gradle -v

# if we are running the test in docker compose, change to dev.Dockerfile WORKDIR otherwise preserve default behaviour
echo "$DRIVER"
if [ "$DRIVER" == "http://selenium-hub:4444/wd/hub" ]; then
  echo "running in docker compose as the environment variable DRIVER is the selinium hubs service name as specified in docker-compose.dev.yml"
  echo "preserving current working directory which is"
  pwd
else
  echo "not in docker-compose"
  cd /
  docker compose -f "docker-compose.yml" up -d --build
  jq --help
  exit 1
fi

echo "Environment: $TEST_ENVIRONMENT"

echo "Current Working Directory: $PWD"

gradle -q test --info

echo "Successfully generated report"

exit 0