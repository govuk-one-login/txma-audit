#!/usr/bin/env bash

AWS_PROFILE="event-processing-dev"
PAYLOAD=$(cat invoke-event-processor-payload.json | base64  -)
FUNCTION_NAME="EventProcessorFunction-TxMATwoAudit"

aws lambda invoke --function-name "$FUNCTION_NAME" --invocation-type Event --payload "$PAYLOAD" outfile.txt --profile $AWS_PROFILE
