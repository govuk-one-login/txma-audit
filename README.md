# di-txma-audit
Digital Identity Auditing Services

This repository stores code for both the Event Processing account Infrastructure and Audit account infrastructure.

## Event Processing

Event Processing allows for various services to integrate into the TxMA journey. We do this by pulling messages from an SQS queue owned by the various services owners. <br>
These Messages are then asynchronously processed by a Lambda function in order to validate the message body. If a message fails validation it will not be processed. If a message is successfully validated it will be published to an SNS topic in order to fan out to a number of other services:

1. Audit account - Storage for RAW messages in S3.
2. TiCF - Splunk Index containing redacted data.
3. Performance - Splunk Index containing redacted data.

Redaction of the raw data in the case of TiCF and Performance is undertaken by the Obfuscation Lambda. This function runs during the processing step of our
Kinesis FireHose implementation in order to hash any sensitve data before sending to Splunk.

The Event Processing account contains the following AWS Lambda functions:

* Event Processor
* Obfuscation
* Re-Ingest (Not yet implemented)

The remaining infrastructure covers the following AWS services:

* SNS
* KMS
* Kinesis FireHose
* Secret Manager
* S3

see: https://github.com/alphagov/di-txma-audit/tree/main/event-processing

## Audit

The Audit account uses a Kinesis FireHose resource to subscribe to the SNS topic hosted in the Event Processing account. This will batch and store the RAW event messages in an S3 bucket.

Access to this account is restricted in order to prevent access to the sensitive PII data.

Limited access will be granted in order to retrieve records that need to be audited. We will allow these records to be viewed for a limited time frame using the AWS Athena tool.

The Audit account contains the following infrastructure:

* Kinesis FireHose
* KMS
* S3
* Athena (Not yet implemented)

see: https://github.com/alphagov/di-txma-audit/tree/main/audit


