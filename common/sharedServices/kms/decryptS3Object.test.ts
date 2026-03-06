import { KmsKeyringNode } from '@aws-crypto/client-node'
import { buildDecrypt } from '@aws-crypto/decrypt-node'
import { Readable } from 'node:stream'
import { logger } from '../logger'
import {
  decryptS3Object,
  decryptWithSpecificKey,
  DualKeyDecryptionError
} from './decryptS3Object'

jest.mock('@aws-crypto/client-node', () => ({
  KmsKeyringNode: jest.fn()
}))

jest.mock('@aws-crypto/decrypt-node', () => ({
  buildDecrypt: jest.fn().mockReturnValue({
    decrypt: jest.fn()
  })
}))

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

const mockKmsKeyringNode = KmsKeyringNode as jest.Mock
const mockBuildDecrypt = buildDecrypt as jest.Mock
const mockLogger = logger as jest.Mocked<typeof logger>

const TEST_PRIMARY_KEY = 'arn:aws:kms:eu-west-2:111122223333:key/primary-key'
const TEST_SECONDARY_KEY =
  'arn:aws:kms:eu-west-2:111122223333:key/secondary-key'
const TEST_PLAINTEXT_DATA = Buffer.from('decrypted audit data')
const TEST_ENCRYPTED_DATA = Buffer.from('encrypted data')

describe('decryptS3Object', () => {
  let mockDecrypt: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.GENERATOR_KEY_ID = TEST_PRIMARY_KEY
    process.env.BACKUP_KEY_ID = TEST_SECONDARY_KEY

    mockKmsKeyringNode.mockImplementation(<T>(config: T): T => config)
    mockDecrypt = jest.fn()
    mockBuildDecrypt.mockReturnValue({ decrypt: mockDecrypt })
  })

  afterEach(() => {
    delete process.env.GENERATOR_KEY_ID
    delete process.env.BACKUP_KEY_ID
  })

  describe('Scenario 1 - Decryption with key 1', () => {
    it('successfully decrypts data using primary key', async () => {
      mockDecrypt.mockResolvedValue({
        plaintext: TEST_PLAINTEXT_DATA,
        messageHeader: { encryptedDataKeys: [] }
      })

      const result = await decryptS3Object(TEST_ENCRYPTED_DATA)

      expect(result.plaintext).toEqual(TEST_PLAINTEXT_DATA)
      expect(result.usedKey).toBe('primary')
      expect(mockKmsKeyringNode).toHaveBeenCalledWith({
        keyIds: [TEST_PRIMARY_KEY]
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully decrypted using primary key',
        expect.objectContaining({ keyType: 'primary' })
      )
    })
  })

  describe('Scenario 2 - Decryption with key 2', () => {
    it('successfully decrypts data using secondary key when primary fails', async () => {
      mockDecrypt
        .mockRejectedValueOnce(new Error('KMS key not accessible'))
        .mockResolvedValueOnce({
          plaintext: TEST_PLAINTEXT_DATA,
          messageHeader: { encryptedDataKeys: [] }
        })

      const result = await decryptS3Object(TEST_ENCRYPTED_DATA)

      expect(result.plaintext).toEqual(TEST_PLAINTEXT_DATA)
      expect(result.usedKey).toBe('secondary')
      expect(mockLogger.error).toHaveBeenCalledWith(
        'DEGRADED_MODE: Decryption using secondary key succeeded',
        expect.objectContaining({
          keyType: 'secondary',
          alertType: 'KMS_KEY_DEGRADED_MODE',
          severity: 'HIGH'
        })
      )
    })
  })

  describe('Scenario 3 - Decryption with second key if 1 is missing', () => {
    it('falls back to secondary key when primary is unavailable', async () => {
      const primaryKeyError = new Error('Key is unavailable')
      mockDecrypt.mockRejectedValueOnce(primaryKeyError).mockResolvedValueOnce({
        plaintext: TEST_PLAINTEXT_DATA,
        messageHeader: { encryptedDataKeys: [] }
      })

      const result = await decryptS3Object(TEST_ENCRYPTED_DATA)

      expect(result.plaintext).toEqual(TEST_PLAINTEXT_DATA)
      expect(result.usedKey).toBe('secondary')
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Primary key decryption failed, attempting secondary key',
        expect.objectContaining({ keyType: 'primary' })
      )
    })
  })

  describe('Scenario 4 - Decryption with first key if 2 is missing', () => {
    it('uses primary key successfully (no fallback needed)', async () => {
      mockDecrypt.mockResolvedValue({
        plaintext: TEST_PLAINTEXT_DATA,
        messageHeader: { encryptedDataKeys: [] }
      })

      const result = await decryptS3Object(TEST_ENCRYPTED_DATA)

      expect(result.plaintext).toEqual(TEST_PLAINTEXT_DATA)
      expect(result.usedKey).toBe('primary')
      expect(mockDecrypt).toHaveBeenCalledTimes(1)
    })
  })

  describe('Scenario 5 - Neither key is available', () => {
    it('throws DualKeyDecryptionError when both keys fail', async () => {
      mockDecrypt
        .mockRejectedValueOnce(new Error('Primary key not accessible'))
        .mockRejectedValueOnce(new Error('Secondary key not accessible'))

      await expect(decryptS3Object(TEST_ENCRYPTED_DATA)).rejects.toThrow(
        DualKeyDecryptionError
      )

      expect(mockLogger.error).toHaveBeenCalledWith(
        'CRITICAL: Both primary and secondary KMS keys unavailable',
        expect.objectContaining({
          alertType: 'KMS_DUAL_KEY_FAILURE',
          severity: 'CRITICAL'
        })
      )
    })

    it('DualKeyDecryptionError contains both error details', async () => {
      mockDecrypt
        .mockRejectedValueOnce(new Error('Primary key error'))
        .mockRejectedValueOnce(new Error('Secondary key error'))

      await expect(decryptS3Object(TEST_ENCRYPTED_DATA)).rejects.toMatchObject({
        name: 'DualKeyDecryptionError',
        primaryKeyError: { message: 'Primary key error' },
        secondaryKeyError: { message: 'Secondary key error' }
      })
    })
  })

  describe('Input handling', () => {
    it('handles Readable stream input', async () => {
      const stream = Readable.from(TEST_ENCRYPTED_DATA)
      mockDecrypt.mockResolvedValue({
        plaintext: TEST_PLAINTEXT_DATA,
        messageHeader: { encryptedDataKeys: [] }
      })

      const result = await decryptS3Object(stream)
      expect(result.usedKey).toBe('primary')
    })

    it('handles Buffer input', async () => {
      mockDecrypt.mockResolvedValue({
        plaintext: TEST_PLAINTEXT_DATA,
        messageHeader: { encryptedDataKeys: [] }
      })

      const result = await decryptS3Object(TEST_ENCRYPTED_DATA)
      expect(result.usedKey).toBe('primary')
    })
  })

  describe('Environment variable validation', () => {
    it('throws error when GENERATOR_KEY_ID is not set', async () => {
      delete process.env.GENERATOR_KEY_ID
      await expect(decryptS3Object(TEST_ENCRYPTED_DATA)).rejects.toThrow(
        'Missing environment variable: GENERATOR_KEY_ID'
      )
    })
  })
})

describe('decryptWithSpecificKey', () => {
  let mockDecrypt: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockKmsKeyringNode.mockImplementation(<T>(config: T): T => config)
    mockDecrypt = jest.fn()
    mockBuildDecrypt.mockReturnValue({ decrypt: mockDecrypt })
  })

  it('decrypts using the specified key', async () => {
    mockDecrypt.mockResolvedValue({
      plaintext: TEST_PLAINTEXT_DATA,
      messageHeader: { encryptedDataKeys: [] }
    })

    const result = await decryptWithSpecificKey(
      TEST_ENCRYPTED_DATA,
      TEST_PRIMARY_KEY
    )

    expect(result).toEqual(TEST_PLAINTEXT_DATA)
    expect(mockKmsKeyringNode).toHaveBeenCalledWith({
      keyIds: [TEST_PRIMARY_KEY]
    })
  })

  it('propagates decryption errors', async () => {
    mockDecrypt.mockRejectedValue(new Error('KMS access denied'))
    await expect(
      decryptWithSpecificKey(TEST_ENCRYPTED_DATA, TEST_PRIMARY_KEY)
    ).rejects.toThrow('KMS access denied')
  })
})
