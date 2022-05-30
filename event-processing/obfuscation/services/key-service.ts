import AWS from 'aws-sdk';
import { AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { GetSecretValueResponse } from 'aws-sdk/clients/secretsmanager';

export class KeyService {
    static async getHmacKey(): Promise<string> {
        // Load the AWS SDK
        const region = 'eu-west-2';
        const secretArn: string | undefined = process.env.SECRET_ARN;
        let secret: string;
        let data: PromiseResult<GetSecretValueResponse, AWSError>;

        if (secretArn == undefined) throw 'Unable to load secret from environment';

        const secretManager = new AWS.SecretsManager({ region: region });

        try {
            data = await secretManager.getSecretValue({ SecretId: secretArn }).promise();
        } catch (e) {
            throw 'Unable to load secret from secret manager';
        }

        if (data.SecretBinary) {
            secret = Buffer.from(data.SecretBinary.toString(), 'base64').toString('ascii');
        } else if (data.SecretString) {
            secret = data.SecretString;
        } else {
            throw 'Unable to load secret from data';
        }

        return secret;
    }
}
