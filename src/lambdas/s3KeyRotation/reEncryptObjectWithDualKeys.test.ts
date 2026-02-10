import { KmsKeyringNode } from '@aws-crypto/client-node'
import { buildDecrypt } from '@aws-crypto/decrypt-node'
import { buildEncrypt } from '@aws-crypto/encrypt-node'
import { getS3ObjectAsStream } from '../../../common/sharedServices/s3/getS3ObjectAsStream'
import { putS3Object } from '../../../common/sharedServices/s3/putS3Object'
import { createDataStream } from '../../../common/utils/tests/test-helpers/test-helper'
import { reEncryptObjectWithDualKeys } from './reEncryptObjectWithDualKeys'

jest.mock('@aws-crypto/client-node', () => ({
  KmsKeyringNode: jest.fn()
}))

jest.mock('@aws-crypto/decrypt-node', () => ({
  buildDecrypt: jest.fn().mockReturnValue({
    decrypt: jest.fn()
  })
}))

jest.mock('@aws-crypto/encrypt-node', () => ({
  buildEncrypt: jest.fn().mockReturnValue({
    encrypt: jest.fn()
  })
}))

jest.mock('../../../common/sharedServices/s3/getS3ObjectAsStream', () => ({
  getS3ObjectAsStream: jest.fn()
}))

jest.mock('../../../common/sharedServices/s3/putS3Object', () => ({
  putS3Object: jest.fn()
}))

const mockKmsKeyringNode = KmsKeyringNode as jest.Mock
const mockBuildDecrypt = buildDecrypt as jest.Mock
const mockBuildEncrypt = buildEncrypt as jest.Mock
const mockGetS3ObjectAsStream = getS3ObjectAsStream as jest.Mock
const mockPutS3Object = putS3Object as jest.Mock

const TEST_BUCKET = 'test-audit-bucket'
const TEST_KEY = 'audit-data/2024/01/15/file.gz.enc'
const TEST_WRAPPER_KEY_1 =
  'arn:aws:kms:eu-west-2:111122223333:key/wrapper-key-1'
const TEST_WRAPPER_KEY_2 =
  'arn:aws:kms:eu-west-2:111122223333:key/wrapper-key-2'
const TEST_PLAINTEXT_DATA = Buffer.from('decrypted audit data')
const TEST_ENCRYPTED_DATA = Buffer.from('encrypted-with-dual-keys')

describe('reEncryptObjectWithDualKeys', () => {
  let mockDecrypt: jest.Mock
  let mockEncrypt: jest.Mock

  beforeEach(() => {
    jest.resetAllMocks()
    process.env.WRAPPER_KEY_1_ID = TEST_WRAPPER_KEY_1
    process.env.WRAPPER_KEY_2_ID = TEST_WRAPPER_KEY_2

    // KmsKeyringNode is mocked to just return the config object for testing
    mockKmsKeyringNode.mockImplementation(<T>(config: T): T => config)

    mockDecrypt = jest.fn()
    mockEncrypt = jest.fn()

    mockBuildDecrypt.mockReturnValue({ decrypt: mockDecrypt })
    mockBuildEncrypt.mockReturnValue({ encrypt: mockEncrypt })
  })

  afterEach(() => {
    delete process.env.WRAPPER_KEY_1_ID
    delete process.env.WRAPPER_KEY_2_ID
  })

  it('successfully re-encrypts an object with dual keys', async () => {
    const encryptedStream = createDataStream('encrypted-content')
    const mockMessageHeader = {
      encryptedDataKeys: [
        { providerId: 'aws-kms', providerInfo: TEST_WRAPPER_KEY_1 }
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
      keyIds: [TEST_WRAPPER_KEY_1]
    })

    // Verify decryption
    expect(mockBuildDecrypt).toHaveBeenCalled()
    expect(mockDecrypt).toHaveBeenCalled()

    // Verify encrypt keyring setup with dual keys
    expect(mockKmsKeyringNode).toHaveBeenCalledWith({
      generatorKeyId: TEST_WRAPPER_KEY_1,
      keyIds: [TEST_WRAPPER_KEY_2]
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

  it('throws error when WRAPPER_KEY_1_ID is not set', async () => {
    delete process.env.WRAPPER_KEY_1_ID

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('Missing environment variable: WRAPPER_KEY_1_ID')

    expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled()
  })

  it('throws error when WRAPPER_KEY_2_ID is not set', async () => {
    delete process.env.WRAPPER_KEY_2_ID

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('Missing environment variable: WRAPPER_KEY_2_ID')

    expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled()
  })

  it('propagates S3 retrieval errors', async () => {
    mockGetS3ObjectAsStream.mockRejectedValue(new Error('S3 access denied'))

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('S3 access denied')

    expect(mockDecrypt).not.toHaveBeenCalled()
  })

  it('propagates decryption errors', async () => {
    const encryptedStream = createDataStream('encrypted-content')
    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecrypt.mockRejectedValue(new Error('KMS decryption failed'))

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('KMS decryption failed')

    expect(mockEncrypt).not.toHaveBeenCalled()
  })

  it('propagates encryption errors', async () => {
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
    const encryptedStream = createDataStream('encrypted-content')
    const mockMessageHeader = {
      encryptedDataKeys: [
        { providerId: 'aws-kms', providerInfo: TEST_WRAPPER_KEY_1 },
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
