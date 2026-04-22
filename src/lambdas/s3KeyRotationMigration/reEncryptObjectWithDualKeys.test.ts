import { KmsKeyringNode } from '@aws-crypto/client-node'
import { buildDecrypt } from '@aws-crypto/decrypt-node'
import { buildEncrypt } from '@aws-crypto/encrypt-node'
import { getS3ObjectAsStream } from '../../../common/sharedServices/s3/getS3ObjectAsStream'
import { putS3Object } from '../../../common/sharedServices/s3/putS3Object'
import { createDataStream } from '../../../common/utils/tests/test-helpers/test-helper'
import { reEncryptObjectWithDualKeys } from './reEncryptObjectWithDualKeys'
import type { Mock, MockedFunction } from 'vitest'
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'

vi.mock('@aws-crypto/client-node', () => ({
  KmsKeyringNode: vi.fn()
}))

vi.mock('@aws-crypto/decrypt-node', () => ({
  buildDecrypt: vi.fn().mockReturnValue({
    decrypt: vi.fn()
  })
}))

vi.mock('@aws-crypto/encrypt-node', () => ({
  buildEncrypt: vi.fn().mockReturnValue({
    encrypt: vi.fn()
  })
}))

vi.mock('../../../common/sharedServices/s3/getS3ObjectAsStream', () => ({
  getS3ObjectAsStream: vi.fn()
}))

vi.mock('../../../common/sharedServices/s3/putS3Object', () => ({
  putS3Object: vi.fn()
}))

vi.mock('../../../common/sharedServices/kms/createKmsClientProvider', () => ({
  createKmsClientProvider: vi.fn(() => vi.fn())
}))

const mockKmsKeyringNode = KmsKeyringNode as MockedFunction<
  typeof KmsKeyringNode
>
const mockBuildDecrypt = buildDecrypt as MockedFunction<typeof buildDecrypt>
const mockBuildEncrypt = buildEncrypt as MockedFunction<typeof buildEncrypt>
const mockGetS3ObjectAsStream = getS3ObjectAsStream as MockedFunction<
  typeof getS3ObjectAsStream
>
const mockPutS3Object = putS3Object as MockedFunction<typeof putS3Object>

const TEST_BUCKET = 'test-audit-bucket'
const TEST_KEY = 'audit-data/2024/01/15/file.gz.enc'
const TEST_GENERATOR_KEY =
  'arn:aws:kms:eu-west-2:111122223333:key/generator-key'
const TEST_BACKUP_KEY = 'arn:aws:kms:eu-west-2:111122223333:key/backup-key'
const TEST_PLAINTEXT_DATA = Buffer.from('decrypted audit data')
const TEST_ENCRYPTED_DATA = Buffer.from('encrypted-with-dual-keys')

describe('reEncryptObjectWithDualKeys', () => {
  let mockDecrypt: Mock
  let mockEncrypt: Mock

  beforeEach(() => {
    vi.resetAllMocks()
    process.env.GENERATOR_KEY_ID = TEST_GENERATOR_KEY
    process.env.BACKUP_KEY_ID = TEST_BACKUP_KEY

    // KmsKeyringNode is mocked to just return the config object for testing
    mockKmsKeyringNode.mockImplementation(<T>(config: T): T => config)

    mockDecrypt = vi.fn()
    mockEncrypt = vi.fn()

    mockBuildDecrypt.mockReturnValue({
      decrypt: mockDecrypt
    } as unknown as ReturnType<typeof buildDecrypt>)
    mockBuildEncrypt.mockReturnValue({
      encrypt: mockEncrypt
    } as unknown as ReturnType<typeof buildEncrypt>)
  })

  afterEach(() => {
    delete process.env.GENERATOR_KEY_ID
    delete process.env.BACKUP_KEY_ID
  })

  it('successfully re-encrypts an object with dual keys', async () => {
    // Unit Test
    const encryptedStream = createDataStream('encrypted-content')
    const mockMessageHeader = {
      encryptedDataKeys: [
        { providerId: 'aws-kms', providerInfo: TEST_GENERATOR_KEY }
      ]
    }

    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecrypt.mockResolvedValue({
      plaintext: TEST_PLAINTEXT_DATA,
      messageHeader: mockMessageHeader
    })
    mockEncrypt.mockResolvedValue({
      result: TEST_ENCRYPTED_DATA
    })

    await reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)

    // Verify S3 object retrieval
    expect(mockGetS3ObjectAsStream).toHaveBeenCalledWith(TEST_BUCKET, TEST_KEY)

    // Verify decrypt keyring setup
    expect(mockKmsKeyringNode).toHaveBeenCalledWith({
      keyIds: [TEST_GENERATOR_KEY],
      clientProvider: expect.any(Function) // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    })

    // Verify decryption
    expect(mockBuildDecrypt).toHaveBeenCalled()
    expect(mockDecrypt).toHaveBeenCalled()

    // Verify encrypt keyring setup with dual keys
    expect(mockKmsKeyringNode).toHaveBeenCalledWith({
      generatorKeyId: TEST_GENERATOR_KEY,
      keyIds: [TEST_BACKUP_KEY],
      clientProvider: expect.any(Function) // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    })

    // Verify encryption
    expect(mockBuildEncrypt).toHaveBeenCalled()
    expect(mockEncrypt).toHaveBeenCalled()

    // Verify S3 object write
    expect(mockPutS3Object).toHaveBeenCalledWith(
      TEST_BUCKET,
      TEST_KEY,
      TEST_ENCRYPTED_DATA
    )
  })

  it('throws error when GENERATOR_KEY_ID is not set', async () => {
    // Unit Test
    delete process.env.GENERATOR_KEY_ID

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('Missing environment variable: GENERATOR_KEY_ID')

    expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled()
  })

  it('throws error when BACKUP_KEY_ID is not set', async () => {
    // Unit Test
    delete process.env.BACKUP_KEY_ID

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('Missing environment variable: BACKUP_KEY_ID')

    expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled()
  })

  it('propagates S3 retrieval errors', async () => {
    // Unit Test
    mockGetS3ObjectAsStream.mockRejectedValue(new Error('S3 access denied'))

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('S3 access denied')

    expect(mockDecrypt).not.toHaveBeenCalled()
  })

  it('propagates decryption errors', async () => {
    // Unit Test
    const encryptedStream = createDataStream('encrypted-content')
    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecrypt.mockRejectedValue(new Error('KMS decryption failed'))

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('KMS decryption failed')

    expect(mockEncrypt).not.toHaveBeenCalled()
  })

  it('propagates encryption errors', async () => {
    // Unit Test
    const encryptedStream = createDataStream('encrypted-content')
    const mockMessageHeader = {
      encryptedDataKeys: [{ providerId: 'aws-kms' }]
    }

    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecrypt.mockResolvedValue({
      plaintext: TEST_PLAINTEXT_DATA,
      messageHeader: mockMessageHeader
    })
    mockEncrypt.mockRejectedValue(new Error('KMS encryption failed'))

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('KMS encryption failed')

    expect(mockPutS3Object).not.toHaveBeenCalled()
  })

  it('propagates S3 write errors', async () => {
    // Unit Test
    const encryptedStream = createDataStream('encrypted-content')
    const mockMessageHeader = {
      encryptedDataKeys: [{ providerId: 'aws-kms' }]
    }

    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecrypt.mockResolvedValue({
      plaintext: TEST_PLAINTEXT_DATA,
      messageHeader: mockMessageHeader
    })
    mockEncrypt.mockResolvedValue({
      result: TEST_ENCRYPTED_DATA
    })
    mockPutS3Object.mockRejectedValue(new Error('S3 write failed'))

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('S3 write failed')
  })

  it('handles objects with multiple encrypted data keys', async () => {
    // Unit Test
    const encryptedStream = createDataStream('encrypted-content')
    const mockMessageHeader = {
      encryptedDataKeys: [
        { providerId: 'aws-kms', providerInfo: TEST_GENERATOR_KEY },
        { providerId: 'aws-kms', providerInfo: 'some-other-key' }
      ]
    }

    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecrypt.mockResolvedValue({
      plaintext: TEST_PLAINTEXT_DATA,
      messageHeader: mockMessageHeader
    })
    mockEncrypt.mockResolvedValue({
      result: TEST_ENCRYPTED_DATA
    })

    await reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)

    expect(mockPutS3Object).toHaveBeenCalledWith(
      TEST_BUCKET,
      TEST_KEY,
      TEST_ENCRYPTED_DATA
    )
  })
})
