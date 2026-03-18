import { DescribeKeyCommand } from '@aws-sdk/client-kms'
import { kmsClient } from './kmsClient'

/**
 * Verifies that a KMS key exists and is accessible.
 *
 * @param keyId - The KMS key ARN or ID to verify
 * @returns The key metadata if accessible
 */
export const verifyKmsKeyAccess = async (keyId: string) => {
  const command = new DescribeKeyCommand({ KeyId: keyId })
  return kmsClient.send(command)
}
