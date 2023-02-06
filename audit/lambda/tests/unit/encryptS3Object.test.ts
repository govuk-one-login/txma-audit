import { encryptS3Object } from '../../kmsServices/encryptS3Object';
import { KmsKeyringNode, buildClient, CommitmentPolicy } from '@aws-crypto/client-node';
import { when } from 'jest-when';
import { createDataStream } from '../test-helpers/test-helper';
import { MessageHeader } from '@aws-crypto/serialize';
import {
    TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
    TEST_GENERATOR_KEY_ID,
    TEST_S3_OBJECT_DATA_STRING,
} from '../testConstants';

jest.mock('@aws-crypto/client-node', () => ({
    KmsKeyringNode: jest.fn(),
    buildClient: jest.fn().mockReturnValue({
        encrypt: jest.fn(),
    }),
    CommitmentPolicy: { REQUIRE_ENCRYPT_REQUIRE_DECRYPT: 'REQUIRE_ENCRYPT_REQUIRE_DECRYPT' },
}));

const mockKmsKeyringNode = KmsKeyringNode as jest.Mock;
process.env.GENERATOR_KEY_ID = TEST_GENERATOR_KEY_ID;

describe('encryptS3Object', () => {
    it('returns a buffer of encrypted data', async () => {
        when(mockKmsKeyringNode).mockImplementation(() => ({ generatorKeyId: TEST_GENERATOR_KEY_ID }));
        when(buildClient().encrypt).mockResolvedValue({
            result: TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
            messageHeader: {} as MessageHeader,
        });
        const testDataStream = createDataStream(TEST_S3_OBJECT_DATA_STRING);

        const result = await encryptS3Object(testDataStream);

        expect(result).toEqual(TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER);
        expect(KmsKeyringNode).toHaveBeenCalledWith({ generatorKeyId: TEST_GENERATOR_KEY_ID });
        expect(buildClient).toHaveBeenCalledWith(CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT);
        expect(buildClient().encrypt).toHaveBeenCalledWith({ generatorKeyId: TEST_GENERATOR_KEY_ID }, testDataStream);
    });
});
