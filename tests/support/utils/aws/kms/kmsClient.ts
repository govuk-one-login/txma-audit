import { KMSClient } from '@aws-sdk/client-kms'
import { getEnv } from '../../../../../common/utils/helpers/getEnv'

export const kmsClient = new KMSClient({ region: getEnv('AWS_REGION') })
