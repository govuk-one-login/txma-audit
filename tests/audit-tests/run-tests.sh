#!/usr/bin/env bash

set -eu

gradle -v

echo "Current Environment $TEST_ENVIRONMENT"

./gradlew clean test -PTEST_REPORT_DIR=$TEST_REPORT_DIR

exit 0