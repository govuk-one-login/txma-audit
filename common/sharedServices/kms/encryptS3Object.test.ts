import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildEncrypt, MessageHeader } from '@aws-crypto/encrypt-node'
import { KmsKeyringNode } from '@aws-crypto/client-node'
import { createDataStream } from '../../utils/tests/test-helpers/test-helper'
import {
  TEST_GENERATOR_KEY_ID,
  TEST_ADDITIONAL_KEY_ID,
  TEST_ENCRYPTED_S3_OBJECT_DATA_BUFFER,
  TEST_S3_OBJECT_DATA_STRING
} from '../../utils/tests/testConstants'
import { encryptS3Object } from '../../sharedServices/kms/encryptS3Object'
import * as env from '../../utils/helpers/getEnv'

const mockEncrypt = vi.fn()

vi.mock('@aws-crypto/encrypt-node', () => ({
  buildEncrypt: vi.fn(() => ({
    encrypt: mockEncrypt
  }))
}))
vi.mock('@aws-crypto/client-node', () => ({
  KmsKeyringNode: vi.fn()
}))

vi.mock('../../utils/helpers/getEnv', () => ({
  getEnv: vi.fn()
}))

const mockGetEnv = env as { getEnv: ReturnType<typeof vi.fn> }

describe('encryptS3Object', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('returns a buffer of encrypted data when backup enabled', async () => {
    mockGetEnv.getEnv.mockImplementation((key: string) => {
      if (key === 'BACKUP_ENCRYPTION_ENABLED') return 'true'
      if (key === 'GENERATOR_KEY_ID') return TEST_GENERATOR_KEY_ID
      if (key === 'BACKUP_KEY_ID') return TEST_ADDITIONAL_KEY_ID
      return ''
    })

    vi.mocked(KmsKeyringNode).mockImplementation(function (
      this: any,
      config: any
    ) {
      this.generatorKeyId = config.generatorKeyId
      this.keyIds = config.keyIds
    } as any)

    mockEncrypt.mockResolvedValue({
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
    expect(mockEncrypt).toHaveBeenCalledWith(
      expect.objectContaining({
        generatorKeyId: TEST_GENERATOR_KEY_ID,
        keyIds: [TEST_ADDITIONAL_KEY_ID]
      }),
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

    vi.mocked(KmsKeyringNode).mockImplementation(function (
      this: any,
      config: any
    ) {
      this.generatorKeyId = config.generatorKeyId
    } as any)

    mockEncrypt.mockResolvedValue({
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
    expect(mockEncrypt).toHaveBeenCalledWith(
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

    vi.mocked(KmsKeyringNode).mockImplementation(function (
      this: any,
      config: any
    ) {
      this.generatorKeyId = config.generatorKeyId
    } as any)

    mockEncrypt.mockResolvedValue({
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
