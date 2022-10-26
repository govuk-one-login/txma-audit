#!/usr/bin/env bash

set -eu

gradle -v

cd /

echo "Environment: $TEST_ENVIRONMENT"

echo "Current Working Directory: $PWD"

gradle -q test --info --stacktrace

cp null/result.json report/result.json
cp null/result.xml report/result.xml

echo "Successfully generated report"

exit 0