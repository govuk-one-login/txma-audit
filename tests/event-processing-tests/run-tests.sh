#!/usr/bin/env bash

set -eu

gradle -v

cd /

echo "Environment: $TEST_ENVIRONMENT"

echo "$PWD"

gradle -q test

echo "Successfully generated report"

exit 0