#!/usr/bin/env bash

set -eu

gradle -v

#cd /

mkdir $TEST_ENVIRONMENT

echo "Environment: $TEST_ENVIRONMENT"

#export CFN_SqsURL="https://sqs.eu-west-2.amazonaws.com/750703655225/PublishToAccountsSQSQueue-build"
#echo "Environment: $TEST_ENVIRONMENT"
#echo "CFN_SqsURL: $CFN_SqsURL"
echo "Current Working Directory: $PWD"

# gradle -q test --info --stacktrace

cp null/result.json $TEST_ENVIRONMENT/result.json
cp null/result.xml $TEST_ENVIRONMENT/result.xml

echo "Successfully generated report"

exit 0
