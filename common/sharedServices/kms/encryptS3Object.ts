import { KmsKeyringNode } from '@aws-crypto/client-node'
import { buildEncrypt } from '@aws-crypto/encrypt-node'
import { Readable } from 'stream'
import { getEnv } from '../../utils/helpers/getEnv'

export const encryptS3Object = async (data: Readable): Promise<Buffer> => {
  let keyring: KmsKeyringNode;

  if (process.env.NODE_ENV == 'production') {
    keyring = new KmsKeyringNode({
      generatorKeyId: getEnv('GENERATOR_KEY_ID')
    })
  } else {
    keyring = new KmsKeyringNode({
      generatorKeyId: getEnv('GENERATOR_KEY_ID'),
      keyIds: [getEnv('BACKUP_KEY_ID')]
    })
  }
  // considering including context in encryption - considered good practice to do so
  // if included, the same context object will be required for decryption
  // const context = {
  //     some: 'key',
  // };
  const { encrypt } = buildEncrypt()

  const { result } = await encrypt(keyring, data)

  return result
}
