# S3 Key Rotation Lambda

## Purpose

One-time data migration Lambda to transition audit objects from single-key to dual-key encryption for KMS key rotation.

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
npm test -- src/lambdas/s3KeyRotation

# Run specific test file
npm test -- src/lambdas/s3KeyRotation/handler.test.ts
```

## Local Testing

```bash
# Using AWS CLI
aws lambda invoke \
  --function-name txma-audit-s3-key-rotation \
  --payload file://src/lambdas/s3KeyRotation/test-event.json \
  response.json
```
