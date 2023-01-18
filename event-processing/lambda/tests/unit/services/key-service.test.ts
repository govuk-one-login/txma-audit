/* eslint-disable */
import { getHmacKey } from '../../../services/key-service';
import { mockClient } from 'aws-sdk-client-mock'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { HmacException } from '../../../exceptions/hmac-exception';
import { HmacKeysEnum } from '../../../enums/hmac-key.enum';

const secretManagerMock = mockClient(SecretsManagerClient)

describe('Unit test for key-service', function () {

    beforeEach(() => {
        secretManagerMock.reset();
        process.env.SECRET_ARN = 'obfuscation-secret-string';
        process.env.PERFORMANCE_SECRET_ARN = 'performance-secret-string';
        secretManagerMock.on(GetSecretValueCommand, { SecretId: 'obfuscation-secret-string' }).resolves({
            $metadata: {
                httpStatusCode: 200,
                requestId: '1',
                extendedRequestId: '1',
                cfId: '1',
                attempts: 1,
            },
            SecretString: 'obfuscation-secret-value',
        });
        secretManagerMock.on(GetSecretValueCommand, { SecretId: 'performance-secret-string' }).resolves({
            $metadata: {
                httpStatusCode: 200,
                requestId: '1',
                extendedRequestId: '1',
                cfId: '1',
                attempts: 1,
            },
            SecretString: 'performance-secret-value',
        });
      })

    it('returns the performance hmac key if passed the performance hmacEnum', async () => {
        
        const result = await getHmacKey(HmacKeysEnum.performance)
    
        expect(result).toEqual('performance-secret-value')
    });

    it('returns the obfuscation hmac key if passed an hmacEnum other than performance', async () => {
        
        const result = await getHmacKey(HmacKeysEnum.obfuscation)
    
        expect(result).toEqual('obfuscation-secret-value')
    });

});
