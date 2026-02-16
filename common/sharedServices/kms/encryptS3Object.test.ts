import { buildEncrypt, MessageHeader } from '@aws-crypto/encrypt-node'
import { KmsKeyringNode } from '@aws-crypto/client-node'
import { when } from 'jest-when'
import { createDataStream } from '../../utils/tests/test-helpers/test-helper'
import {
  TEST_GENERATOR_KEY_ID,
  TEST_ADDITIONAL_KEY_ID,
  TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
  TEST_S3_OBJECT_DATA_STRING
} from '../../utils/tests/testConstants'
import * as env from '../../../common/utils/helpers/getEnv'
import { encryptS3Object } from '../../../common/sharedServices/kms/encryptS3Object'

jest.mock('@aws-crypto/encrypt-node', () => ({
  buildEncrypt: jest.fn().mockReturnValue({
    encrypt: jest.fn()
  })
}))
jest.mock('@aws-crypto/client-node', () => ({
  KmsKeyringNode: jest.fn()
}))

jest.mock('../../utils/helpers/getEnv', () => ({
  getEnv: null
}))

const mockGetEnv = env as {getEnv: jest.Mock}

describe('encryptS3Object', () => {
  it('returns a buffer of encrypted data when backup enabled', async () => {
    mockGetEnv.getEnv = jest.fn().mockReturnValue('true')
    when(KmsKeyringNode as jest.Mock).mockImplementation(() => ({
      generatorKeyId: TEST_GENERATOR_KEY_ID,
      keyIds: [TEST_ADDITIONAL_KEY_ID]
    }))
    when(buildEncrypt().encrypt).mockResolvedValue({
      result: TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
      messageHeader: {} as MessageHeader
    })
    const testDataStream = createDataStream(TEST_S3_OBJECT_DATA_STRING)
    const result = await encryptS3Object(testDataStream)
    expect(result).toEqual(TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER)
    expect(KmsKeyringNode).toHaveBeenCalledWith({
      generatorKeyId: TEST_GENERATOR_KEY_ID,
      keyIds: [TEST_ADDITIONAL_KEY_ID]
    })
    expect(buildEncrypt).toHaveBeenCalled()
    expect(buildEncrypt().encrypt).toHaveBeenCalledWith(
      {
        generatorKeyId: TEST_GENERATOR_KEY_ID,
        keyIds: [TEST_ADDITIONAL_KEY_ID]
      },
      testDataStream
    )
  })
  it('returns a buffer of encrypted data when backup not enabled', async () => {
    mockGetEnv.getEnv = jest.fn().mockReturnValue('false')
    when(KmsKeyringNode as jest.Mock).mockImplementation(() => ({
      generatorKeyId: TEST_GENERATOR_KEY_ID
    }))
    when(buildEncrypt().encrypt).mockResolvedValue({
      result: TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
      messageHeader: {} as MessageHeader
    })
    const testDataStream = createDataStream(TEST_S3_OBJECT_DATA_STRING)
    const result = await encryptS3Object(testDataStream)
    expect(result).toEqual(TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER)
    expect(KmsKeyringNode).toHaveBeenCalledWith({
      generatorKeyId: TEST_GENERATOR_KEY_ID
    })
    expect(buildEncrypt).toHaveBeenCalled()
    expect(buildEncrypt().encrypt).toHaveBeenCalledWith(
      {
        generatorKeyId: TEST_GENERATOR_KEY_ID
      },
      testDataStream
    )
  })
})
