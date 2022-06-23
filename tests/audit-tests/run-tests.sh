#!/usr/bin/env bash

set -eu

gradle -v

echo "Current Environment $TEST_ENVIRONMENT"

./gradlew clean test

exit 0