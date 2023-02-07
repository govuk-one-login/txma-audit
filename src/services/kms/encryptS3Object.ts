import {
  KmsKeyringNode,
  buildClient,
  CommitmentPolicy
} from '@aws-crypto/client-node'
import { Readable } from 'stream'
import { getEnv } from '../../utils/helpers'

export const encryptS3Object = async (data: Readable): Promise<Buffer> => {
  const keyring = new KmsKeyringNode({
    generatorKeyId: getEnv('GENERATOR_KEY_ID')
  })
  // considering including context in encryption - considered good practice to do so
  // if included, the same context object will be required for decryption
  // const context = {
  //     some: 'key',
  // };
  const { encrypt } = buildClient(
    CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
  )

  const { result } = await encrypt(keyring, data)

  return result
}
