#!/usr/bin/env bash

set -eu

gradle -v

# if we are running the test in docker compose, change to dev.Dockerfile WORKDIR otherwise preserve default behaviour
if [[ -z "${DRIVER}" ]] && [ "$DRIVER" == "http://selenium-hub:4444/wd/hub" ]; then
  echo "running in docker compose as the environment variable DRIVER is the selinium hubs service name as specified in docker-compose.dev.yml"
  echo "preserving current working directory which is"
  pwd
else
  echo "not in docker-compose"
  cd /
  docker compose -f "docker-compose.yml" up -d --build
  export DRIVER="http://localhost:4444/wd/hub"
  jq --help
fi

echo "Environment: $TEST_ENVIRONMENT"

echo "Current Working Directory: $PWD"

echo "Selenium Grid URL for RemoteWebDriver: $DRIVER"

sleep 10

gradle -q test --info

echo "Successfully generated report"

exit 0