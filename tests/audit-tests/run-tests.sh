#!/usr/bin/env bash

set -eu

gradle -v

echo "Environment: $TEST_ENVIRONMENT"
echo "Access Key Id: $AWS_ACCESS_KEY_ID"
echo "Secret Access Key: $AWS_SECRET_ACCESS_KEY"
echo "Session Token: $AWS_SESSION_TOKEN"
echo "Security Token: $AWS_SECURITY_TOKEN"

cd /home/AutomationUser

./gradlew clean test -PTEST_REPORT_DIR=$TEST_REPORT_DIR

exit 0