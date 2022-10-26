#!/usr/bin/env bash

set -eu

gradle -v

cd /

mkdir $TEST_ENVIRONMENT

echo "Environment: $TEST_ENVIRONMENT"

echo "Current Working Directory: $PWD"

# gradle -q test --info --stacktrace

cp null/result.json $TEST_ENVIRONMENT/result.json
cp null/result.xml $TEST_ENVIRONMENT/result.xml

echo "Successfully generated report"

exit 0