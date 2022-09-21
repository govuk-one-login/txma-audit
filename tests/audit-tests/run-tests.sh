#!/usr/bin/env bash

set -eu

gradle -v

cd /

IPVCoreStubURL=$(aws cloudformation describe-stacks --region "eu-west-2" --stack-name "audit-config" --query "Stacks[0].Outputs[?OutputKey=='IPVCoreStubURL'].OutputValue" --output text)
echo "IPVCoreStubURL: $IPVCoreStubURL"
export IPVCoreStubURL=$IPVCoreStubURL

OrchestrationStubURL=$(aws cloudformation describe-stacks --region "eu-west-2" --stack-name "audit-config" --query "Stacks[0].Outputs[?OutputKey=='OrchestrationStubURL'].OutputValue" --output text)
echo "OrchestrationStubURL: $OrchestrationStubURL"
export OrchestrationStubURL=$OrchestrationStubURL

echo "Environment: $TEST_ENVIRONMENT"

echo "Current Working Directory: $PWD"

gradle -q test --info

echo "Successfully generated report"

exit 0