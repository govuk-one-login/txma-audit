#!/usr/bin/env bash

set -eu

gradle -v

cd /

mkdir results

echo "Environment: $TEST_ENVIRONMENT"

echo "Current Working Directory: $PWD"

# gradle -q test --info --stacktrace

cp null/result.json results/result.json
cp null/result.xml results/result.xml

echo "Successfully generated report"

exit 0