import { HmacException } from '../exceptions/hmac-exception';
import { GetSecretValueCommand, GetSecretValueResponse, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

export class KeyService {
    static client = new SecretsManagerClient({ region: 'eu-west-2' });

    static async getHmacKey(): Promise<string> {
        const secretArn: string | undefined = process.env.SECRET_ARN;
        let secret: string;
        let data: GetSecretValueResponse;

        if (secretArn == undefined) throw new HmacException('Unable to load secret ARN from environment');

        try {
            data = await this.client.send(new GetSecretValueCommand({ SecretId: secretArn }));
        } catch (e) {
            throw new HmacException('Unable to load secret from secret manager', e as Error);
        }

        if (data.SecretBinary) {
            secret = Buffer.from(data.SecretBinary.toString(), 'base64').toString('ascii');
        } else if (data.SecretString) {
            secret = data.SecretString;
        } else {
            throw new HmacException('Secret does not contain a secret value');
        }

        return secret;
    }
}
