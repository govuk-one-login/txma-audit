import { KmsKeyringNode } from '@aws-crypto/client-node'
import { buildEncrypt } from '@aws-crypto/encrypt-node'
import { logger } from '../../../common/sharedServices/logger'
import {
  decryptS3Object,
  DualKeyDecryptionError
} from '../../../common/sharedServices/kms/decryptS3Object'
import { getS3ObjectAsStream } from '../../../common/sharedServices/s3/getS3ObjectAsStream'
import { putS3Object } from '../../../common/sharedServices/s3/putS3Object'
import { getEnv } from '../../../common/utils/helpers/getEnv'
import { Readable } from 'node:stream'

/**
 * Re-encrypts an S3 object to use dual KMS wrapper keys.
 *
 * This function:
 * 1. Retrieves the encrypted object from S3
 * 2. Decrypts the envelope using primary key (Wrapper Key 1), falling back to secondary (Wrapper Key 2)
 * 3. Re-encrypts the same plaintext using both Wrapper Key 1 and Wrapper Key 2
 * 4. Writes the updated encrypted object back to S3
 *
 * The AWS Encryption SDK handles the dual-key structure automatically when multiple
 * keyrings are provided to the encryption operation.
 *
 * Decryption fallback logic:
 * - Primary key (GENERATOR_KEY_ID) is used first
 * - If primary fails, secondary key (BACKUP_KEY_ID) is used
 * - If both keys fail, DualKeyDecryptionError is thrown (triggers Dynatrace alert)
 *
 * @param bucketName - S3 bucket containing the object
 * @param key - S3 object key
 * @throws DualKeyDecryptionError when both decryption keys are unavailable
 */
export const reEncryptObjectWithDualKeys = async (
  bucketName: string,
  key: string
): Promise<void> => {
  const generatorKeyId = getEnv('GENERATOR_KEY_ID')
  const backupKeyId = getEnv('BACKUP_KEY_ID')

  logger.info('Starting dual-key re-encryption', {
    bucket: bucketName,
    key,
    generatorKeyId,
    backupKeyId
  })

  const encryptedObjectStream = await getS3ObjectAsStream(bucketName, key)
  logger.info('Retrieved encrypted object from S3', { key })

  // Decrypt using dual-key fallback logic
  // Primary key is tried first, with automatic fallback to secondary key
  let decryptionResult
  try {
    decryptionResult = await decryptS3Object(encryptedObjectStream)
    logger.info('Successfully decrypted object', {
      key,
      usedKey: decryptionResult.usedKey
    })
  } catch (error) {
    if (error instanceof DualKeyDecryptionError) {
      logger.error('Failed to decrypt object - both keys unavailable', {
        bucket: bucketName,
        key,
        primaryKeyError: error.primaryKeyError.message,
        secondaryKeyError: error.secondaryKeyError.message
      })
    }
    throw error
  }

  // re-encrypt with dual keys
  // use Generator Key as generator and add Backup Key
  // this creates encrypted data keys for both wrapper keys
  const encryptKeyring = new KmsKeyringNode({
    generatorKeyId: generatorKeyId,
    keyIds: [backupKeyId]
  })
  const { encrypt } = buildEncrypt()
  const plaintextStream = Readable.from(decryptionResult.plaintext)
  const { result } = await encrypt(encryptKeyring, plaintextStream)
  logger.info('Successfully re-encrypted with dual keys', { key })

  await putS3Object(bucketName, key, result)
  logger.info('Successfully updated S3 object with dual-key encryption', {
    bucket: bucketName,
    key
  })
}
