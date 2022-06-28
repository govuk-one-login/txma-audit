#!/usr/bin/env bash

set -eu

gradle -v

echo "Environment: $TEST_ENVIRONMENT"

./gradlew clean test

echo "Successfully generated report"

exit 0