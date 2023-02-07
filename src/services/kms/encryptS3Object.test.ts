import {
  KmsKeyringNode,
  buildClient,
  MessageHeader,
  CommitmentPolicy
} from '@aws-crypto/client-node'
import { when } from 'jest-when'
import { createDataStream } from '../../utils/tests/test-helpers/test-helper'
import {
  TEST_GENERATOR_KEY_ID,
  TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
  TEST_S3_OBJECT_DATA_STRING
} from '../../utils/tests/testConstants'
import { encryptS3Object } from './encryptS3Object'

jest.mock('@aws-crypto/client-node', () => ({
  KmsKeyringNode: jest.fn(),
  buildClient: jest.fn().mockReturnValue({
    encrypt: jest.fn()
  }),
  CommitmentPolicy: {
    REQUIRE_ENCRYPT_REQUIRE_DECRYPT: 'REQUIRE_ENCRYPT_REQUIRE_DECRYPT'
  }
}))

describe('encryptS3Object', () => {
  process.env.GENERATOR_KEY_ID = TEST_GENERATOR_KEY_ID

  it('returns a buffer of encrypted data', async () => {
    when(KmsKeyringNode as jest.Mock).mockImplementation(() => ({
      generatorKeyId: TEST_GENERATOR_KEY_ID
    }))
    when(buildClient().encrypt).mockResolvedValue({
      result: TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
      messageHeader: {} as MessageHeader
    })
    const testDataStream = createDataStream(TEST_S3_OBJECT_DATA_STRING)

    const result = await encryptS3Object(testDataStream)

    expect(result).toEqual(TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER)
    expect(KmsKeyringNode).toHaveBeenCalledWith({
      generatorKeyId: TEST_GENERATOR_KEY_ID
    })
    expect(buildClient).toHaveBeenCalledWith(
      CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
    )
    expect(buildClient().encrypt).toHaveBeenCalledWith(
      { generatorKeyId: TEST_GENERATOR_KEY_ID },
      testDataStream
    )
  })
})
