import { HmacException } from '../exceptions/hmac-exception';
import { GetSecretValueCommand, GetSecretValueResponse, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { HmacKeysEnum } from '../enums/hmac-key.enum';

export const getHmacKey = async (hmacKey: HmacKeysEnum): Promise<string> => {
    const client = new SecretsManagerClient({ region: 'eu-west-2' });
    const secretArn: string | undefined =
        hmacKey == HmacKeysEnum.performance ? process.env.PERFORMANCE_SECRET_ARN : process.env.SECRET_ARN;
    let secret: string;
    let data: GetSecretValueResponse;

    if (secretArn == undefined) throw new HmacException('Unable to load secret ARN from environment');

    try {
        data = await client.send(new GetSecretValueCommand({ SecretId: secretArn }));
    } catch (e) {
        throw new HmacException('Unable to load secret from secret manager', e as Error);
    }

    if (data.SecretBinary) {
        secret = Buffer.from(data.SecretBinary.toString(), 'base64').toString('utf-8');
    } else if (data.SecretString) {
        secret = data.SecretString;
    } else {
        throw new HmacException('Secret does not contain a secret value');
    }

    return secret;
};
