# S3 Key Rotation Lambda

## Purpose

One-time data migration Lambda to transition audit objects from single-key to dual-key encryption for KMS key rotation.

## Files

- **handler.ts** - S3 Batch Operations event handler
- **reEncryptObjectWithDualKeys.ts** - Core re-encryption logic with dual-key fallback
- **handler.test.ts** - Handler unit tests (7 tests)
- **reEncryptObjectWithDualKeys.test.ts** - Re-encryption unit tests (8 tests)
- **test-event.json** - Sample S3 Batch event for testing

## Shared Services

- **common/sharedServices/kms/decryptS3Object.ts** - Dual-key decryption module with automatic fallback
- **common/sharedServices/kms/decryptS3Object.test.ts** - Decryption unit tests (10+ tests)

## How It Works

1. S3 Batch Operations invokes Lambda with list of objects
2. For each object:
   - Retrieve encrypted object from S3
   - Decrypt using dual-key fallback logic (see below)
   - Re-encrypt with both Generator Key + Backup Key
   - Write updated object back to S3
3. Return success/failure result for each task

## Dual-Key Decryption Fallback

The decryption process implements resilient key handling:

### Normal Operation

1. Primary key (Wrapper Key 1 / `GENERATOR_KEY_ID`) is used first
2. Data is decrypted successfully using the internal key wrapped by Wrapper Key 1

### Fallback

1. If primary key fails (e.g., unavailable, access denied)
2. Secondary key (Wrapper Key 2 / `BACKUP_KEY_ID`) is attempted
3. **Alert logged**: `KMS_KEY_DEGRADED_MODE` with severity `HIGH`
4. Data is decrypted using the internal key wrapped by Wrapper Key 2

### Complete Failure

1. If both keys fail
2. **Critical alert logged**: `KMS_DUAL_KEY_FAILURE` with severity `CRITICAL`
3. `DualKeyDecryptionError` is thrown
4. Dynatrace alerting is triggered via log pattern matching

## Alerting

The following log patterns trigger Dynatrace alerts:

### Degraded Mode Alert

```json
{
  "level": "ERROR",
  "message": "DEGRADED_MODE: Decryption using secondary key succeeded",
  "alertType": "KMS_KEY_DEGRADED_MODE",
  "severity": "HIGH"
}
```

### Critical Failure Alert

```json
{
  "level": "ERROR",
  "message": "CRITICAL: Both primary and secondary KMS keys unavailable",
  "alertType": "KMS_DUAL_KEY_FAILURE",
  "severity": "CRITICAL"
}
```

## Testing

```bash
# Run all s3KeyRotationMigration tests
npm test -- src/lambdas/s3KeyRotationMigration

# Run decryption module tests
npm test -- common/sharedServices/kms/decryptS3Object

# Run specific test file
npm test -- src/lambdas/s3KeyRotationMigration/reEncryptObjectWithDualKeys.test.ts
```

## Local Testing

```bash
# Using AWS CLI
aws lambda invoke \
  --function-name txma-audit-s3-key-rotation \
  --payload file://src/lambdas/s3KeyRotationMigration/test-event.json \
  response.json
```
