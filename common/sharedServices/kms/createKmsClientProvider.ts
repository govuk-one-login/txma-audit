import { getClient, limitRegions, KMS } from '@aws-crypto/kms-keyring-node'
import { getEnv } from '../../utils/helpers/getEnv'

/**
 * Creates a client provider for KmsKeyringNode that always uses the configured AWS_REGION.
 * This prevents the keyring from attempting to access KMS in regions extracted from key ARNs,
 * ensuring all KMS operations use the application's configured region.
 *
 * @returns A KMS client supplier configured for the application's region
 */
export const createKmsClientProvider = () => {
  const region = getEnv('AWS_REGION')
  const baseClientProvider = getClient(KMS, { region })
  return limitRegions([region], baseClientProvider)
}
