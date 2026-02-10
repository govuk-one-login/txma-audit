import { KmsKeyringNode } from '@aws-crypto/client-node'
import { buildDecrypt } from '@aws-crypto/decrypt-node'
import { buildEncrypt } from '@aws-crypto/encrypt-node'
import { logger } from '../../../common/sharedServices/logger'
import { getS3ObjectAsStream } from '../../../common/sharedServices/s3/getS3ObjectAsStream'
import { putS3Object } from '../../../common/sharedServices/s3/putS3Object'
import { getEnv } from '../../../common/utils/helpers/getEnv'
import { Readable } from 'stream'

/**
 * Re-encrypts an S3 object to use dual KMS wrapper keys.
 *
 * This function:
 * 1. Retrieves the encrypted object from S3
 * 2. Decrypts the envelope using Wrapper Key 1
 * 3. Re-encrypts the same plaintext using both Wrapper Key 1 and Wrapper Key 2
 * 4. Writes the updated encrypted object back to S3
 *
 * The AWS Encryption SDK handles the dual-key structure automatically when multiple
 * keyrings are provided to the encryption operation.
 *
 * @param bucketName - S3 bucket containing the object
 * @param key - S3 object key
 */
export const reEncryptObjectWithDualKeys = async (
  bucketName: string,
  key: string
): Promise<void> => {
  const wrapperKey1Id = getEnv('WRAPPER_KEY_1_ID')
  const wrapperKey2Id = getEnv('WRAPPER_KEY_2_ID')

  logger.info('Starting dual-key re-encryption', {
    bucket: bucketName,
    key,
    wrapperKey1Id,
    wrapperKey2Id
  })

  const encryptedObjectStream = await getS3ObjectAsStream(bucketName, key)
  logger.info('Retrieved encrypted object from S3', { key })

  // decrypt using Wrapper Key 1
  const decryptKeyring = new KmsKeyringNode({
    keyIds: [wrapperKey1Id]
  })

  const { decrypt } = buildDecrypt()
  const { plaintext, messageHeader } = await decrypt(
    decryptKeyring,
    encryptedObjectStream
  )

  logger.info('Successfully decrypted object', {
    key,
    encryptedDataKeys: messageHeader.encryptedDataKeys.length
  })

  // re-encrypt with dual keys
  // rse Wrapper Key 1 as generator and add Wrapper Key 2
  // this creates encrypted data keys for both wrapper keys
  const encryptKeyring = new KmsKeyringNode({
    generatorKeyId: wrapperKey1Id,
    keyIds: [wrapperKey2Id]
  })
  const { encrypt } = buildEncrypt()
  const plaintextStream = Readable.from(plaintext)
  const { result } = await encrypt(encryptKeyring, plaintextStream)
  logger.info('Successfully re-encrypted with dual keys', { key })

  await putS3Object(bucketName, key, result)
  logger.info('Successfully updated S3 object with dual-key encryption', {
    bucket: bucketName,
    key
  })
}
