import {
  GetSecretValueCommand,
  GetSecretValueCommandInput,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'

export const retrieveSecretValue = async (secretId: string, region: string) => {
  const client = new SecretsManagerClient({
    region
  })
  const command: GetSecretValueCommandInput = {
    SecretId: secretId
  }
  try {
    const data = await client.send(new GetSecretValueCommand(command))
    if (data.SecretString) {
      return data.SecretString
    } else {
      throw new Error(`Secret ${secretId} has no value`)
    }
  } catch (error) {
    throw new Error(`Secret with id ${secretId} not found \n${error}`)
  }
}
