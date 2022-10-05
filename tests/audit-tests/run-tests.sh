#!/usr/bin/env bash

set -eu

MAX_ATTEMPT=7
ATTEMPT_NUMBER=1
WAIT_TIME_SECONDS=5
SELENIUM_READY="false"

# uses exponential backoff retry to ensure the grid is up
grid_status_check() {
  while [[ $ATTEMPT_NUMBER -le $MAX_ATTEMPT || $SELENIUM_READY == "false" ]]; do
    echo "grid check attempt $ATTEMPT_NUMBER out of $MAX_ATTEMPT"
    SELENIUM_READY=$(curl --silent "${DRIVER}/status" | jq ".value.ready")

    if [[ $SELENIUM_READY == "true" ]]; then
      echo "selenium grid reported ready as: $SELENIUM_READY. ready to run tests"
      break
    else
      TIME_TO_WAIT=$((WAIT_TIME_SECONDS * ATTEMPT_NUMBER))
      echo "selenium check value: $SELENIUM_READY"
      echo "waiting $TIME_TO_WAIT seconds before re-checking if grid is ready"
      sleep $TIME_TO_WAIT
      ATTEMPT_NUMBER=$((ATTEMPT_NUMBER+1))
    fi
  done

  echo "returning selenium ready state as $SELENIUM_READY"

}

gradle -v

# If variable not set or null, set it to localhost as if we were running it using docker-compose, compose will set DRIVER for us.
# DRIVER="${DRIVER:="http://localhost:4444/wd/hub"}"

# echo "Selenium Grid URL for RemoteWebDriver: $DRIVER"

# # if we are running the test in docker compose, change to dev.Dockerfile WORKDIR otherwise we are running selenium directly on the host as we cannot run docker in docker
# if [ "$DRIVER" == "http://selenium-hub:4444/wd/hub" ]; then
#   echo "running in docker compose as the environment variable DRIVER is the selinium hubs service name as specified in docker-compose.dev.yml"
#   echo "preserving current working directory which is"
#   pwd
# else
#   echo "environment variable DRIVER exists but is not the selinium hubs service name. using the default localhost variant"
#   cd /
#   echo "running selenium grid in background"
#   nohup java -jar selenium-server.jar standalone &>/dev/null &
# fi

# capture stdout of function call
# grid_status_check

# sleep 60

# if [[ $SELENIUM_READY != "true" ]]; then
#   echo "selenium grid status is $SELENIUM_READY. exit with status code 1"
#   exit 1
# else
#   echo "selenium is ready to run tests"
# fi

cd /

echo "Environment: $TEST_ENVIRONMENT"

echo "Current Working Directory: $PWD"

gradle -q test --info

echo "Successfully generated report"

exit 0
