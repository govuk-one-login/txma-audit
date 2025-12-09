# Disaster Recovery: Restore PermanentMessageBatchBucket from Backup

## Overview

This guide covers restoring objects from AWS Backup to the PermanentMessageBatchBucket after account loss.

## Prerequisites

1. New AWS account with IAC deployed
2. Restored backup bucket from AWS Backup
3. AWS CLI configured OR GitHub Actions access

## Option 1: GitHub Actions (Recommended)

### Setup

1. Deploy the CloudFormation template to create `GHActionsBaaSDeployRole`
2. Add GitHub repository secrets:
   - `GH_ACTIONS_BUILD_BAAS_ROLE_ARN`
   - `GH_ACTIONS_STAGING_BAAS_ROLE_ARN`
   - `GH_ACTIONS_INTEGRATION_BAAS_ROLE_ARN`
   - `GH_ACTIONS_PRODUCTION_BAAS_ROLE_ARN`

### Run Restore

1. Go to **Actions** tab in GitHub repository
2. Select **Run BaaS S3 Restore** workflow
3. Fill in parameters:
   - **Environment**: Target environment (dev/build/staging/integration/production)
   - **Restored Bucket**: Name of the restored backup bucket
   - **Permanent Bucket**: (Optional) Override default bucket name
   - **Prefix**: (Optional) Filter objects by prefix
4. Click **Run workflow**

## Option 2: Local Execution

### Run Restore

```bash
# Make script executable
chmod +x scripts/restore-backup-objects.sh

# Run restore with pagination (handles large datasets)
./scripts/restore-backup-objects.sh \
  <restored-backup-bucket-name> \
  <permanent-bucket-name> \
  [aws-profile] \
  [optional-prefix]

# Examples:
./scripts/restore-backup-objects.sh \
  my-restored-backup-bucket \
  audit-build-permanent-message-batch \
  default

./scripts/restore-backup-objects.sh \
  my-restored-backup-bucket \
  audit-production-permanent-message-batch \
  prod-profile \
  "2024/01/"
```

## Features

### GitHub Actions Workflow

- **Automated execution** with audit logging
- **OIDC authentication** using GitHub Actions role
- **Parameter validation** and error handling
- **Artifact upload** for audit logs (90-day retention)
- **Environment-specific** role selection

### Restore Script

- **Metadata preservation** using `--metadata-directive COPY`
- **Pagination support** for large buckets
- **Progress tracking** with batch indicators
- **Prefix filtering** for selective restore
- **Error handling** with exit on failure
- **Storage class control** (restores to STANDARD)

## Verification Steps

1. Check object count matches:

```bash
aws s3 ls s3://source-bucket --recursive --summarize
aws s3 ls s3://target-bucket --recursive --summarize
```

2. Verify lifecycle policies are active on target bucket
3. Confirm encryption settings match original configuration
4. Check GitHub Actions audit logs for execution details

## Important Notes

- **No IAM policy management needed** - Uses existing GitHub Actions role
- Objects will be restored to STANDARD storage class initially
- Lifecycle policies will transition objects to GLACIER_IR after 90 days
- Original metadata and timestamps are preserved
- Bucket notifications will trigger for new objects
- GitHub Actions provides full audit trail with 90-day log retention

## Troubleshooting

- **Permission errors**: Ensure GitHub secrets are configured with correct role ARNs
- **Bucket access errors**: Verify restored bucket exists and is accessible
- **Large datasets**: Use prefix filtering to process data in smaller batches
- **Timeout issues**: GitHub Actions has 120-minute timeout for restore operations
