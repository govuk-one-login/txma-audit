import { KmsKeyringNode } from '@aws-crypto/client-node'
import { buildEncrypt } from '@aws-crypto/encrypt-node'
import {
  decryptS3Object,
  DualKeyDecryptionError
} from '../../../common/sharedServices/kms/decryptS3Object'
import { getS3ObjectAsStream } from '../../../common/sharedServices/s3/getS3ObjectAsStream'
import { putS3Object } from '../../../common/sharedServices/s3/putS3Object'
import { createDataStream } from '../../../common/utils/tests/test-helpers/test-helper'
import { reEncryptObjectWithDualKeys } from './reEncryptObjectWithDualKeys'

jest.mock('@aws-crypto/client-node', () => ({
  KmsKeyringNode: jest.fn()
}))

jest.mock('@aws-crypto/encrypt-node', () => ({
  buildEncrypt: jest.fn().mockReturnValue({
    encrypt: jest.fn()
  })
}))

jest.mock('../../../common/sharedServices/kms/decryptS3Object', () => ({
  decryptS3Object: jest.fn(),
  DualKeyDecryptionError: class DualKeyDecryptionError extends Error {
    primaryKeyError: Error
    secondaryKeyError: Error
    constructor(primaryKeyError: Error, secondaryKeyError: Error) {
      super(
        'Decryption failed: Both primary and secondary KMS keys are unavailable'
      )
      this.name = 'DualKeyDecryptionError'
      this.primaryKeyError = primaryKeyError
      this.secondaryKeyError = secondaryKeyError
    }
  }
}))

jest.mock('../../../common/sharedServices/s3/getS3ObjectAsStream', () => ({
  getS3ObjectAsStream: jest.fn()
}))

jest.mock('../../../common/sharedServices/s3/putS3Object', () => ({
  putS3Object: jest.fn()
}))

const mockKmsKeyringNode = KmsKeyringNode as jest.Mock
const mockBuildEncrypt = buildEncrypt as jest.Mock
const mockDecryptS3Object = decryptS3Object as jest.Mock
const mockGetS3ObjectAsStream = getS3ObjectAsStream as jest.Mock
const mockPutS3Object = putS3Object as jest.Mock

const TEST_BUCKET = 'test-audit-bucket'
const TEST_KEY = 'audit-data/2024/01/15/file.gz.enc'
const TEST_GENERATOR_KEY =
  'arn:aws:kms:eu-west-2:111122223333:key/generator-key'
const TEST_BACKUP_KEY = 'arn:aws:kms:eu-west-2:111122223333:key/backup-key'
const TEST_PLAINTEXT_DATA = Buffer.from('decrypted audit data')
const TEST_ENCRYPTED_DATA = Buffer.from('encrypted-with-dual-keys')

describe('reEncryptObjectWithDualKeys', () => {
  let mockEncrypt: jest.Mock

  beforeEach(() => {
    jest.resetAllMocks()
    process.env.GENERATOR_KEY_ID = TEST_GENERATOR_KEY
    process.env.BACKUP_KEY_ID = TEST_BACKUP_KEY

    // KmsKeyringNode is mocked to just return the config object for testing
    mockKmsKeyringNode.mockImplementation(<T>(config: T): T => config)

    mockEncrypt = jest.fn()
    mockBuildEncrypt.mockReturnValue({ encrypt: mockEncrypt })
  })

  afterEach(() => {
    delete process.env.GENERATOR_KEY_ID
    delete process.env.BACKUP_KEY_ID
  })

  it('successfully re-encrypts an object with dual keys using primary key', async () => {
    const encryptedStream = createDataStream('encrypted-content')

    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecryptS3Object.mockResolvedValue({
      plaintext: TEST_PLAINTEXT_DATA,
      usedKey: 'primary'
    })
    mockEncrypt.mockResolvedValue({
      result: TEST_ENCRYPTED_DATA
    })

    await reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)

    // Verify S3 object retrieval
    expect(mockGetS3ObjectAsStream).toHaveBeenCalledWith(TEST_BUCKET, TEST_KEY)

    // Verify decryption was called with the stream
    expect(mockDecryptS3Object).toHaveBeenCalledWith(encryptedStream)

    // Verify encrypt keyring setup with dual keys
    expect(mockKmsKeyringNode).toHaveBeenCalledWith({
      generatorKeyId: TEST_GENERATOR_KEY,
      keyIds: [TEST_BACKUP_KEY]
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

  it('successfully re-encrypts using secondary key when primary fails (fallback)', async () => {
    const encryptedStream = createDataStream('encrypted-content')

    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecryptS3Object.mockResolvedValue({
      plaintext: TEST_PLAINTEXT_DATA,
      usedKey: 'secondary'
    })
    mockEncrypt.mockResolvedValue({
      result: TEST_ENCRYPTED_DATA
    })

    await reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)

    // Verify decryption was called (fallback handled internally by decryptS3Object)
    expect(mockDecryptS3Object).toHaveBeenCalledWith(encryptedStream)

    // Verify S3 object write
    expect(mockPutS3Object).toHaveBeenCalledWith(
      TEST_BUCKET,
      TEST_KEY,
      TEST_ENCRYPTED_DATA
    )
  })

  it('throws error when GENERATOR_KEY_ID is not set', async () => {
    delete process.env.GENERATOR_KEY_ID

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('Missing environment variable: GENERATOR_KEY_ID')

    expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled()
  })

  it('throws error when BACKUP_KEY_ID is not set', async () => {
    delete process.env.BACKUP_KEY_ID

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('Missing environment variable: BACKUP_KEY_ID')

    expect(mockGetS3ObjectAsStream).not.toHaveBeenCalled()
  })

  it('propagates S3 retrieval errors', async () => {
    mockGetS3ObjectAsStream.mockRejectedValue(new Error('S3 access denied'))

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('S3 access denied')

    expect(mockDecryptS3Object).not.toHaveBeenCalled()
  })

  it('propagates DualKeyDecryptionError when both keys fail', async () => {
    const encryptedStream = createDataStream('encrypted-content')
    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)

    const dualKeyError = new DualKeyDecryptionError(
      new Error('Primary key failed'),
      new Error('Secondary key failed')
    )
    mockDecryptS3Object.mockRejectedValue(dualKeyError)

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow(DualKeyDecryptionError)

    expect(mockEncrypt).not.toHaveBeenCalled()
  })

  it('propagates encryption errors', async () => {
    const encryptedStream = createDataStream('encrypted-content')

    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecryptS3Object.mockResolvedValue({
      plaintext: TEST_PLAINTEXT_DATA,
      usedKey: 'primary'
    })
    mockEncrypt.mockRejectedValue(new Error('KMS encryption failed'))

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('KMS encryption failed')

    expect(mockPutS3Object).not.toHaveBeenCalled()
  })

  it('propagates S3 write errors', async () => {
    const encryptedStream = createDataStream('encrypted-content')

    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecryptS3Object.mockResolvedValue({
      plaintext: TEST_PLAINTEXT_DATA,
      usedKey: 'primary'
    })
    mockEncrypt.mockResolvedValue({
      result: TEST_ENCRYPTED_DATA
    })
    mockPutS3Object.mockRejectedValue(new Error('S3 write failed'))

    await expect(
      reEncryptObjectWithDualKeys(TEST_BUCKET, TEST_KEY)
    ).rejects.toThrow('S3 write failed')
  })

  it('re-encrypts successfully regardless of which key was used for decryption', async () => {
    const encryptedStream = createDataStream('encrypted-content')

    mockGetS3ObjectAsStream.mockResolvedValue(encryptedStream)
    mockDecryptS3Object.mockResolvedValue({
      plaintext: TEST_PLAINTEXT_DATA,
      usedKey: 'secondary'
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
