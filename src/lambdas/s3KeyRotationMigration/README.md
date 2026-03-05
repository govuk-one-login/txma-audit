# S3 Key Rotation Migration Lambda

## Purpose

One-off migration Lambda that transitions audit objects in the Permanent Message Batch S3 bucket from single-key encryption to dual-key (Wrapper Key 1 + Wrapper Key 2) encryption.
This enables KMS key rotation by ensuring every object is recoverable using either wrapper key.

## Files

- **handler.ts** - S3 Batch Operations event handler
- **reEncryptObjectWithDualKeys.ts** - Core re-encryption logic
- **handler.test.ts** - Handler unit tests (7 tests)
- **reEncryptObjectWithDualKeys.test.ts** - Re-encryption unit tests (8 tests)
- **test-event.json** - Sample S3 Batch event for testing

## How It Works

1. S3 Batch Operations invokes Lambda with list of objects
2. For each object:
   - Retrieve encrypted object from S3
   - Decrypt using Generator Key (AWS Encryption SDK)
   - Re-encrypt with both Generator Key + Backup Key
   - Write updated object back to S3
3. Return success/failure result for each task

## Environment Variables

- `GENERATOR_KEY_ID` - ARN of current KMS generator key
- `BACKUP_KEY_ID` - ARN of new KMS backup key

## Testing

```bash
# Run all tests
npm test -- src/lambdas/s3KeyRotationMigration

# Run specific test file
npm test -- src/lambdas/s3KeyRotationMigration/handler.test.ts
```

## Local Testing

```bash
# Using AWS CLI
aws lambda invoke \
  --function-name txma-audit-s3-key-rotation \
  --payload file://src/lambdas/s3KeyRotationMigration/test-event.json \
  response.json
```
