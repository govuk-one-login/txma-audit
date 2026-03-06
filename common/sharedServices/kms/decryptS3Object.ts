import { KmsKeyringNode } from '@aws-crypto/client-node'
import { buildDecrypt } from '@aws-crypto/decrypt-node'
import { Readable } from 'node:stream'
import { logger } from '../logger'
import { getEnv } from '../../utils/helpers/getEnv'

/**
 * Result of a successful decryption operation.
 */
export interface DecryptionResult {
  plaintext: Buffer
  usedKey: 'primary' | 'secondary'
}

/**
 * Error thrown when both decryption keys are unavailable.
 */
export class DualKeyDecryptionError extends Error {
  public readonly primaryKeyError: Error
  public readonly secondaryKeyError: Error

  constructor(primaryKeyError: Error, secondaryKeyError: Error) {
    super(
      'Decryption failed: Both primary and secondary KMS keys are unavailable'
    )
    this.name = 'DualKeyDecryptionError'
    this.primaryKeyError = primaryKeyError
    this.secondaryKeyError = secondaryKeyError
  }
}

/**
 * Decrypts an S3 object using dual KMS wrapper keys with automatic fallback.
 *
 * This function implements resilient decryption that:
 * 1. Attempts decryption using the primary wrapper key (GENERATOR_KEY_ID)
 * 2. Falls back to secondary wrapper key (BACKUP_KEY_ID) if primary fails
 * 3. Logs a warning alert when operating in degraded mode (using fallback key)
 * 4. Throws DualKeyDecryptionError when both keys are unavailable
 *
 * @param encryptedData - Readable stream or Buffer of encrypted data
 * @returns DecryptionResult containing plaintext and which key was used
 * @throws DualKeyDecryptionError when both keys are unavailable (triggers Dynatrace alert)
 */
export const decryptS3Object = async (
  encryptedData: Readable | Buffer
): Promise<DecryptionResult> => {
  const primaryKeyId = getEnv('GENERATOR_KEY_ID')
  const secondaryKeyId = getEnv('BACKUP_KEY_ID')

  // Try primary key first
  try {
    const plaintext = await attemptDecryption(encryptedData, primaryKeyId)
    logger.info('Successfully decrypted using primary key', {
      keyType: 'primary',
      keyId: primaryKeyId
    })
    return { plaintext, usedKey: 'primary' }
  } catch (primaryError) {
    logger.warn('Primary key decryption failed, attempting secondary key', {
      keyType: 'primary',
      keyId: primaryKeyId,
      errorMessage:
        primaryError instanceof Error ? primaryError.message : 'Unknown error'
    })

    // Try secondary key as fallback
    try {
      const plaintext = await attemptDecryption(encryptedData, secondaryKeyId)

      // Log degraded mode warning for Dynatrace alerting
      logger.error('DEGRADED_MODE: Decryption using secondary key succeeded', {
        keyType: 'secondary',
        keyId: secondaryKeyId,
        primaryKeyId,
        primaryKeyError:
          primaryError instanceof Error
            ? primaryError.message
            : 'Unknown error',
        alertType: 'KMS_KEY_DEGRADED_MODE',
        severity: 'HIGH'
      })

      return { plaintext, usedKey: 'secondary' }
    } catch (secondaryError) {
      // Both keys failed - log critical error for Dynatrace alerting
      logger.error(
        'CRITICAL: Both primary and secondary KMS keys unavailable',
        {
          alertType: 'KMS_DUAL_KEY_FAILURE',
          severity: 'CRITICAL',
          primaryKeyId,
          secondaryKeyId,
          primaryKeyError:
            primaryError instanceof Error
              ? primaryError.message
              : 'Unknown error',
          secondaryKeyError:
            secondaryError instanceof Error
              ? secondaryError.message
              : 'Unknown error'
        }
      )

      throw new DualKeyDecryptionError(
        primaryError instanceof Error
          ? primaryError
          : new Error('Unknown primary key error'),
        secondaryError instanceof Error
          ? secondaryError
          : new Error('Unknown secondary key error')
      )
    }
  }
}

/**
 * Attempts decryption using a single KMS key.
 *
 * @param encryptedData - Readable stream or Buffer of encrypted data
 * @param keyId - KMS key ARN to use for decryption
 * @returns Buffer containing decrypted plaintext
 */
const attemptDecryption = async (
  encryptedData: Readable | Buffer,
  keyId: string
): Promise<Buffer> => {
  const keyring = new KmsKeyringNode({
    keyIds: [keyId]
  })

  const { decrypt } = buildDecrypt()

  // Convert Buffer to Readable if necessary for AWS Encryption SDK
  const dataStream = Buffer.isBuffer(encryptedData)
    ? Readable.from(encryptedData)
    : encryptedData

  const { plaintext } = await decrypt(keyring, dataStream)

  return plaintext
}

/**
 * Decrypts an S3 object using a specific key (for testing/explicit key selection).
 *
 * @param encryptedData - Readable stream or Buffer of encrypted data
 * @param keyId - KMS key ARN to use for decryption
 * @returns Buffer containing decrypted plaintext
 */
export const decryptWithSpecificKey = async (
  encryptedData: Readable | Buffer,
  keyId: string
): Promise<Buffer> => {
  logger.info('Attempting decryption with specific key', { keyId })
  return attemptDecryption(encryptedData, keyId)
}
