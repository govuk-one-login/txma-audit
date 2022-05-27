import AWS from "aws-sdk";
import { AWSError } from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";
import { GetSecretValueResponse } from "aws-sdk/clients/secretsmanager";

export class KeyService {
    static async getHmacKey(): Promise<string>  {
        // Load the AWS SDK
        var region : string = "eu-west-2",
        secretName : string = "arn:aws:secretsmanager:eu-west-2:248098332657:secret:ObfuscationHMACSecret-LaDT1y",
        secret : string;

        let secretManager = new AWS.SecretsManager({ region: region });
        const data : PromiseResult<GetSecretValueResponse, AWSError> = await secretManager.getSecretValue({ SecretId: secretName }).promise();
        if(data.SecretBinary) {
            secret = Buffer.from(data.SecretBinary.toString(), 'base64').toString('ascii');
        } else if (data.SecretString) {
            secret = data.SecretString;
        } else {
            throw("Unable to load secret");
        }
            return secret;   
    }
}