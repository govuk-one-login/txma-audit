import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { S3BatchEvent, S3BatchResult } from 'aws-lambda'
import { randomUUID } from 'crypto'
import { KmsKeyringNode } from '@aws-crypto/client-node'
import { buildEncrypt } from '@aws-crypto/encrypt-node'
import { buildDecrypt } from '@aws-crypto/decrypt-node'
import { Readable } from 'node:stream'
import { invokeLambdaFunction } from '../../support/utils/aws/lambda/invokeLambda'
import { getEnv } from '../../../common/utils/helpers/getEnv'
import { verifyKmsKeyAccess } from '../../support/utils/aws/kms/verifyKmsKeyAccess'
import { s3Client } from '../../support/utils/aws/s3/s3Client'
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'

const TEST_PREFIX = 'integration-test/s3-key-rotation'

/**
 * Encrypts plaintext data using the AWS Encryption SDK with a single generator key.
 * Simulates the original single-key encryption state of objects in the bucket.
 */
const encryptWithSingleKey = async (
  generatorKeyId: string,
  plaintext: Buffer
): Promise<Buffer> => {
  const keyring = new KmsKeyringNode({ generatorKeyId })
  const { encrypt } = buildEncrypt()
  const { result } = await encrypt(keyring, Readable.from(plaintext))
  return result
}

/**
 * Decrypts data using the AWS Encryption SDK and returns plaintext + metadata.
 */
const decryptWithKeyring = async (
  keyIds: string[],
  ciphertext: Buffer
): Promise<{ plaintext: Buffer; encryptedDataKeyCount: number }> => {
  const keyring = new KmsKeyringNode({ keyIds })
  const { decrypt } = buildDecrypt()
  const { plaintext, messageHeader } = await decrypt(
    keyring,
    Readable.from(ciphertext)
  )
  return {
    plaintext,
    encryptedDataKeyCount: messageHeader.encryptedDataKeys.length
  }
}

/**
 * Uploads an encrypted test object to S3 for the Lambda to process.
 */
const uploadEncryptedTestObject = async (
  bucket: string,
  key: string,
  generatorKeyId: string,
  data: string
): Promise<void> => {
  const encryptedData = await encryptWithSingleKey(
    generatorKeyId,
    Buffer.from(data)
  )
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: encryptedData
    })
  )
}

/**
 * Gets the raw bytes of an S3 object.
 */
const getS3ObjectBytes = async (
  bucket: string,
  key: string
): Promise<Buffer> => {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  )
  const chunks: Buffer[] = []
  const body = response.Body as Readable
  for await (const chunk of body) {
    chunks.push(Buffer.from(chunk as Uint8Array))
  }
  return Buffer.concat(chunks)
}

/**
 * Removes a test object from S3. Swallows errors if object does not exist.
 */
const deleteTestObject = async (bucket: string, key: string): Promise<void> => {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  } catch {
    // Ignore - object may not exist
  }
}

/**
 * Builds an S3 Batch event payload for the key rotation Lambda.
 */
const createS3BatchEvent = (
  bucketArn: string,
  tasks: { key: string; taskId: string }[]
): S3BatchEvent => ({
  invocationSchemaVersion: '1.0',
  invocationId: randomUUID(),
  job: { id: randomUUID() },
  tasks: tasks.map((t) => ({
    taskId: t.taskId,
    s3Key: t.key,
    s3VersionId: '1',
    s3BucketArn: bucketArn
  }))
})

describe('S3 Key Rotation Migration - Integration Tests', () => {
  let bucketName: string
  let bucketArn: string
  let functionName: string
  let generatorKeyId: string
  let backupKeyId: string
  const testKeys: string[] = []

  beforeAll(() => {
    functionName = getEnv('S3_KEY_ROTATION_FUNCTION_NAME')
    bucketName = getEnv('PERMANENT_MESSAGE_BATCH_BUCKET_NAME')
    bucketArn = `arn:aws:s3:::${bucketName}`
    generatorKeyId = getEnv('GENERATOR_KEY_ID')
    backupKeyId = getEnv('BACKUP_KEY_ID')
  })

  afterAll(async () => {
    // Clean up all test objects
    await Promise.all(testKeys.map((key) => deleteTestObject(bucketName, key)))
  })

  describe('KMS Key Access Verification', () => {
    it('should have access to the Generator Key (WK1)', async () => {
      const response = await verifyKmsKeyAccess(generatorKeyId)

      expect(response.KeyMetadata).toBeDefined()
      expect(response.KeyMetadata?.KeyState).toBe('Enabled')
      expect(response.KeyMetadata?.Arn).toBe(generatorKeyId)
    })

    it('should have access to the Backup Key (WK2)', async () => {
      const response = await verifyKmsKeyAccess(backupKeyId)

      expect(response.KeyMetadata).toBeDefined()
      expect(response.KeyMetadata?.KeyState).toBe('Enabled')
      expect(response.KeyMetadata?.Arn).toBe(backupKeyId)
    })
  })

  describe('Happy Path - Successful Re-encryption', () => {
    it('should re-encrypt a single object with dual keys', async () => {
      // Arrange
      const testData = `audit-event-data-${randomUUID()}`
      const testKey = `${TEST_PREFIX}/${randomUUID()}.gz.enc`
      testKeys.push(testKey)

      await uploadEncryptedTestObject(
        bucketName,
        testKey,
        generatorKeyId,
        testData
      )

      const event = createS3BatchEvent(bucketArn, [
        { key: testKey, taskId: 'task-single' }
      ])

      // Act
      const result = (await invokeLambdaFunction(
        functionName,
        event
      )) as S3BatchResult

      // Assert
      expect(result.results).toHaveLength(1)
      expect(result.results[0].resultCode).toBe('Succeeded')
      expect(result.results[0].resultString).toBe(
        'Object re-encrypted successfully'
      )

      // Verify the object was re-encrypted with dual keys
      const reEncryptedData = await getS3ObjectBytes(bucketName, testKey)
      const { plaintext, encryptedDataKeyCount } = await decryptWithKeyring(
        [generatorKeyId, backupKeyId],
        reEncryptedData
      )

      expect(plaintext.toString()).toBe(testData)
      expect(encryptedDataKeyCount).toBe(2) // WK1 + WK2
    })

    it('should re-encrypt multiple objects in a single batch', async () => {
      // Arrange
      const testObjects = Array.from({ length: 3 }, () => ({
        key: `${TEST_PREFIX}/${randomUUID()}.gz.enc`,
        data: `audit-data-${randomUUID()}`,
        taskId: randomUUID()
      }))
      testObjects.forEach((obj) => testKeys.push(obj.key))

      await Promise.all(
        testObjects.map((obj) =>
          uploadEncryptedTestObject(
            bucketName,
            obj.key,
            generatorKeyId,
            obj.data
          )
        )
      )

      const event = createS3BatchEvent(
        bucketArn,
        testObjects.map((obj) => ({ key: obj.key, taskId: obj.taskId }))
      )

      // Act
      const result = (await invokeLambdaFunction(
        functionName,
        event
      )) as S3BatchResult

      // Assert
      expect(result.results).toHaveLength(3)
      expect(result.results.every((r) => r.resultCode === 'Succeeded')).toBe(
        true
      )

      // Verify each object has dual-key encryption and correct data
      for (const obj of testObjects) {
        const reEncryptedData = await getS3ObjectBytes(bucketName, obj.key)
        const { plaintext, encryptedDataKeyCount } = await decryptWithKeyring(
          [generatorKeyId, backupKeyId],
          reEncryptedData
        )

        expect(plaintext.toString()).toBe(obj.data)
        expect(encryptedDataKeyCount).toBe(2)
      }
    })

    it('should verify the bucket contains Data, WK1, and WK2 encrypted data keys after re-encryption', async () => {
      // Arrange
      const testData = `verify-dual-keys-${randomUUID()}`
      const testKey = `${TEST_PREFIX}/${randomUUID()}.gz.enc`
      testKeys.push(testKey)

      await uploadEncryptedTestObject(
        bucketName,
        testKey,
        generatorKeyId,
        testData
      )

      const event = createS3BatchEvent(bucketArn, [
        { key: testKey, taskId: 'task-verify-keys' }
      ])

      // Act
      await invokeLambdaFunction(functionName, event)

      // Assert - Verify dual-key structure
      const reEncryptedData = await getS3ObjectBytes(bucketName, testKey)

      // Decrypt using only WK1 (Generator Key) - should succeed
      const resultWithWk1 = await decryptWithKeyring(
        [generatorKeyId],
        reEncryptedData
      )
      expect(resultWithWk1.plaintext.toString()).toBe(testData)
      expect(resultWithWk1.encryptedDataKeyCount).toBe(2)

      // Decrypt using only WK2 (Backup Key) - should also succeed
      const resultWithWk2 = await decryptWithKeyring(
        [backupKeyId],
        reEncryptedData
      )
      expect(resultWithWk2.plaintext.toString()).toBe(testData)
      expect(resultWithWk2.encryptedDataKeyCount).toBe(2)
    })

    it('should preserve original data integrity after re-encryption', async () => {
      // Arrange
      const originalData = JSON.stringify({
        event_name: 'AUTH_IPV_CAPACITY_REQUESTED',
        event_id: randomUUID(),
        timestamp: Date.now(),
        component_id: 'integration-test'
      })
      const testKey = `${TEST_PREFIX}/${randomUUID()}.gz.enc`
      testKeys.push(testKey)

      await uploadEncryptedTestObject(
        bucketName,
        testKey,
        generatorKeyId,
        originalData
      )

      const event = createS3BatchEvent(bucketArn, [
        { key: testKey, taskId: 'task-data-integrity' }
      ])

      // Act
      await invokeLambdaFunction(functionName, event)

      // Assert
      const reEncryptedData = await getS3ObjectBytes(bucketName, testKey)
      const { plaintext } = await decryptWithKeyring(
        [generatorKeyId, backupKeyId],
        reEncryptedData
      )

      const decryptedEvent = JSON.parse(plaintext.toString()) as Record<
        string,
        unknown
      >
      const expectedEvent = JSON.parse(originalData) as Record<string, unknown>
      expect(decryptedEvent).toEqual(expectedEvent)
    })
  })

  describe('Unhappy Path - Missing or Invalid Keys', () => {
    it('should return PermanentFailure when the S3 object does not exist', async () => {
      // Arrange
      const nonExistentKey = `${TEST_PREFIX}/non-existent-${randomUUID()}.gz.enc`
      const event = createS3BatchEvent(bucketArn, [
        { key: nonExistentKey, taskId: 'task-missing-object' }
      ])

      // Act
      const result = (await invokeLambdaFunction(
        functionName,
        event
      )) as S3BatchResult

      // Assert
      expect(result.results).toHaveLength(1)
      expect(result.results[0].resultCode).toBe('PermanentFailure')
      expect(result.results[0].resultString).toContain('Failed:')
    })

    it('should return PermanentFailure when object is not encrypted (invalid WK1 decryption)', async () => {
      // Arrange - Upload a plain (unencrypted) object
      const testKey = `${TEST_PREFIX}/${randomUUID()}.gz.enc`
      testKeys.push(testKey)

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: testKey,
          Body: Buffer.from('this-is-not-encrypted-data')
        })
      )

      const event = createS3BatchEvent(bucketArn, [
        { key: testKey, taskId: 'task-invalid-wk1' }
      ])

      // Act
      const result = (await invokeLambdaFunction(
        functionName,
        event
      )) as S3BatchResult

      // Assert
      expect(result.results).toHaveLength(1)
      expect(result.results[0].resultCode).toBe('PermanentFailure')
      expect(result.results[0].resultString).toContain('Failed:')
    })

    it('should handle a mix of valid and invalid tasks in a single batch', async () => {
      // Arrange
      const validData = `valid-data-${randomUUID()}`
      const validKey = `${TEST_PREFIX}/${randomUUID()}.gz.enc`
      const invalidKey = `${TEST_PREFIX}/non-existent-${randomUUID()}.gz.enc`
      testKeys.push(validKey)

      await uploadEncryptedTestObject(
        bucketName,
        validKey,
        generatorKeyId,
        validData
      )

      const event = createS3BatchEvent(bucketArn, [
        { key: validKey, taskId: 'task-valid' },
        { key: invalidKey, taskId: 'task-invalid' }
      ])

      // Act
      const result = (await invokeLambdaFunction(
        functionName,
        event
      )) as S3BatchResult

      // Assert
      expect(result.results).toHaveLength(2)

      const validResult = result.results.find((r) => r.taskId === 'task-valid')
      const invalidResult = result.results.find(
        (r) => r.taskId === 'task-invalid'
      )

      expect(validResult?.resultCode).toBe('Succeeded')
      expect(invalidResult?.resultCode).toBe('PermanentFailure')
    })

    it('should return PermanentFailure for an invalid bucket ARN', async () => {
      // Arrange
      const testKey = `${TEST_PREFIX}/${randomUUID()}.gz.enc`
      const invalidBucketArn = 'arn:aws:s3:::non-existent-bucket-12345'

      const event = createS3BatchEvent(invalidBucketArn, [
        { key: testKey, taskId: 'task-invalid-bucket' }
      ])

      // Act
      const result = (await invokeLambdaFunction(
        functionName,
        event
      )) as S3BatchResult

      // Assert
      expect(result.results).toHaveLength(1)
      expect(result.results[0].resultCode).toBe('PermanentFailure')
      expect(result.results[0].resultString).toContain('Failed:')
    })
  })

  describe('DLQ / Error Handling Behaviour', () => {
    it('should set treatMissingKeysAs to PermanentFailure in the response', async () => {
      // Arrange
      const testData = `dlq-test-${randomUUID()}`
      const testKey = `${TEST_PREFIX}/${randomUUID()}.gz.enc`
      testKeys.push(testKey)

      await uploadEncryptedTestObject(
        bucketName,
        testKey,
        generatorKeyId,
        testData
      )

      const event = createS3BatchEvent(bucketArn, [
        { key: testKey, taskId: 'task-dlq-check' }
      ])

      // Act
      const result = (await invokeLambdaFunction(
        functionName,
        event
      )) as S3BatchResult

      // Assert
      expect(result.treatMissingKeysAs).toBe('PermanentFailure')
    })

    it('should include the invocation schema version in the response', async () => {
      // Arrange
      const testKey = `${TEST_PREFIX}/non-existent-${randomUUID()}.gz.enc`

      const event = createS3BatchEvent(bucketArn, [
        { key: testKey, taskId: 'task-schema-check' }
      ])

      // Act
      const result = (await invokeLambdaFunction(
        functionName,
        event
      )) as S3BatchResult

      // Assert
      expect(result.invocationSchemaVersion).toBe('1.0')
      expect(result.invocationId).toBe(event.invocationId)
    })

    it('should return all task results even when multiple tasks fail', async () => {
      // Arrange
      const failingTasks = Array.from({ length: 3 }, (_, i) => ({
        key: `${TEST_PREFIX}/non-existent-${randomUUID()}.gz.enc`,
        taskId: `task-fail-${i}`
      }))

      const event = createS3BatchEvent(bucketArn, failingTasks)

      // Act
      const result = (await invokeLambdaFunction(
        functionName,
        event
      )) as S3BatchResult

      // Assert
      expect(result.results).toHaveLength(3)
      expect(
        result.results.every((r) => r.resultCode === 'PermanentFailure')
      ).toBe(true)
      expect(
        result.results.every((r) => r.resultString.includes('Failed:'))
      ).toBe(true)
    })
  })
})
