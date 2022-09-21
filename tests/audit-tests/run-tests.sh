#!/usr/bin/env bash

set -eu

gradle -v

cd /

echo "Environment: $TEST_ENVIRONMENT"

if [ "$TEST_ENVIRONMENT" = "build" ] || [ "$TEST_ENVIRONMENT" = "staging" ]
then
  echo "IPVCoreStubURL: $CFN_IPVCoreStubURL"
  echo "OrchestrationStubURL: $CFN_OrchestrationStubURL"
fi

echo "Current Working Directory: $PWD"

gradle -q test --info

echo "Successfully generated report"

exit 0