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
import { encryptS3Object } from '../../../common/sharedServices/kms/encryptS3Object'
import * as env from '../../../common/utils/helpers/getEnv'

jest.mock('@aws-crypto/encrypt-node', () => ({
  buildEncrypt: jest.fn().mockReturnValue({
    encrypt: jest.fn()
  })
}))
jest.mock('@aws-crypto/client-node', () => ({
  KmsKeyringNode: jest.fn()
}))

jest.mock('../../utils/helpers/getEnv', () => ({
  getEnv: jest.fn()
}))

const mockGetEnv = env as { getEnv: jest.Mock }

describe('encryptS3Object', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('returns a buffer of encrypted data when backup enabled', async () => {
    mockGetEnv.getEnv.mockImplementation((key: string) => {
      if (key === 'BACKUP_ENCRYPTION_ENABLED') return 'true'
      if (key === 'GENERATOR_KEY_ID') return TEST_GENERATOR_KEY_ID
      if (key === 'BACKUP_KEY_ID') return TEST_ADDITIONAL_KEY_ID
      return ''
    })
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
    mockGetEnv.getEnv.mockImplementation((key: string) => {
      if (key === 'BACKUP_ENCRYPTION_ENABLED') return 'false'
      if (key === 'GENERATOR_KEY_ID') return TEST_GENERATOR_KEY_ID
      if (key === 'BACKUP_KEY_ID') return TEST_ADDITIONAL_KEY_ID
      return ''
    })
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
  it('treats any non-"true" value for BACKUP_ENCRYPTION_ENABLED as disabled', async () => {
    mockGetEnv.getEnv.mockImplementation((key: string) => {
      if (key === 'BACKUP_ENCRYPTION_ENABLED') return 'TRUE' // uppercase
      if (key === 'GENERATOR_KEY_ID') return TEST_GENERATOR_KEY_ID
      return ''
    })
    when(KmsKeyringNode as jest.Mock).mockImplementation(() => ({
      generatorKeyId: TEST_GENERATOR_KEY_ID
    }))
    when(buildEncrypt().encrypt).mockResolvedValue({
      result: TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
      messageHeader: {} as MessageHeader
    })

    const testDataStream = createDataStream(TEST_S3_OBJECT_DATA_STRING)
    await encryptS3Object(testDataStream)

    expect(KmsKeyringNode).toHaveBeenCalledWith({
      generatorKeyId: TEST_GENERATOR_KEY_ID
    })
    // Verify it was NOT called with keyIds
    expect(KmsKeyringNode).not.toHaveBeenCalledWith(
      expect.objectContaining({
        generatorKeyId: TEST_GENERATOR_KEY_ID,
        keyIds: expect.any(Array) as unknown[]
      })
    )
  })
})
