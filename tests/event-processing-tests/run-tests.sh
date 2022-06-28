#!/usr/bin/env bash

set -eu

gradle -v

echo "Environment: $TEST_ENVIRONMENT"

gradle -q test

echo "Successfully generated report"

exit 0