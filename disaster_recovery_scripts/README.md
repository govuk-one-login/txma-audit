# CloudFormation Resource Removal Scripts

Scripts for removing S3 buckets and their dependencies from CloudFormation templates during disaster recovery scenarios.

## remove-resources-from-template.py

Unified script to remove S3 buckets and all their related resources (alarms, policies, Firehose streams, etc.) from CloudFormation templates.

### Usage

```bash
python3 remove-resources-from-template.py <template-file.json> <bucket-name>
python3 remove-resources-from-template.py <template-file.json> custom <resource1> <resource2> ...
```

### Supported Buckets

#### MessageBatchBucket

Removes the main audit message batch bucket and its complete delivery pipeline:

- `MessageBatchBucket` - S3 bucket
- `MessageBatchBucketPolicy` - S3 bucket policy
- `AuditMessageDeliveryStream` - Kinesis Firehose delivery stream
- `AuditMessageFirehoseProcessingFailureAlarm` - CloudWatch alarm
- `NoAuditMessagesReceivedAlarm` - CloudWatch alarm
- `AuditFirehoseDeliverySuccessPercentage` - CloudWatch alarm
- `AuditFirehoseDeliveryFreshness` - CloudWatch alarm
- `AuditMessageDeliveryStreamSubscription` - SNS subscription
- `AuditMessageDeliveryStreamSubscriptionDeadLetterQueuePolicy` - SQS policy

#### PermanentMessageBatchBucket

Removes the permanent message batch bucket:

- `PermanentMessageBatchBucket` - S3 bucket

### Examples

```bash
# Remove MessageBatchBucket and all dependencies
python3 remove-resources-from-template.py template.json MessageBatchBucket
# Output: template-no-bucket.json

# Remove PermanentMessageBatchBucket
python3 remove-resources-from-template.py template.json PermanentMessageBatchBucket
# Output: template-no-permanentbucket.json

# Remove custom resources
python3 remove-resources-from-template.py template.json custom MyBucket MyBucketPolicy
# Output: template-no-custom-resources.json
```

### What It Does

1. **Removes specified resources** from the CloudFormation template
2. **Cleans up dependencies**:
   - Removes `DependsOn` references to deleted resources
   - Removes stack outputs that reference deleted resources
   - Removes `Ref`, `Fn::GetAtt`, and `Fn::Sub` references
   - Cleans up IAM policy resource arrays
3. **Creates clean template** ready for deployment

### Disaster Recovery Workflow

1. **Download processed template** from deployed stack:

   ```bash
   ./download_processed_template.sh <stack-name>
   ```

2. **Remove bucket resources**:

   ```bash
   python3 remove-resources-from-template.py <stack-name>-processed-template.json MessageBatchBucket
   ```

3. **Deploy modified template** to remove CloudFormation tracking:

   ```bash
   aws cloudformation update-stack --stack-name <stack-name> --template-body file://<stack-name>-processed-template-no-bucket.json
   ```

4. **Deploy original template** to recreate all resources:

   ```bash
   aws cloudformation update-stack --stack-name <stack-name> --template-body file://<stack-name>-processed-template.json
   ```

5. **Restore data** from AWS Backup

### Complete Example

```bash
# Download processed template
./download_processed_template.sh audit

# Remove bucket and dependencies
python3 remove-resources-from-template.py audit-processed-template.json MessageBatchBucket

# Deploy without bucket (removes CloudFormation tracking)
aws cloudformation update-stack --stack-name audit --template-body file://audit-processed-template-no-bucket.json

# Wait for completion
aws cloudformation wait stack-update-complete --stack-name audit

# Deploy with bucket (CloudFormation adopts existing bucket)
aws cloudformation update-stack --stack-name audit --template-body file://audit-processed-template.json
```

## download_processed_template.sh

Downloads the processed CloudFormation template from a deployed stack (with SAM transforms applied).

### Usage

```bash
./download_processed_template.sh <stack-name>
```

### Example

```bash
./download_processed_template.sh audit
# Output: audit-processed-template.json
```

## Files Generated

- `<stack-name>-processed-template.json` - Downloaded processed template from deployed stack
- `*-no-bucket.json` - Template with MessageBatchBucket removed
- `*-no-permanentbucket.json` - Template with PermanentMessageBatchBucket removed

- `*-no-custom-resources.json` - Template with custom resources removed
