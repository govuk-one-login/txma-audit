import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createKmsClientProvider } from './createKmsClientProvider'

const mockGetClient = vi.fn()
const mockLimitRegions = vi.fn()

vi.mock('@aws-crypto/kms-keyring-node', () => ({
  getClient: (...args: unknown[]) => mockGetClient(...args) as unknown,
  limitRegions: (...args: unknown[]) => mockLimitRegions(...args) as unknown,
  KMS: 'MOCK_KMS_CONSTRUCTOR'
}))

vi.mock('../../utils/helpers/getEnv', () => ({
  getEnv: vi.fn(() => 'eu-west-2')
}))

describe('createKmsClientProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a region-limited KMS client provider using the configured AWS_REGION', () => {
    // Unit Test
    const mockBaseProvider = vi.fn()
    const mockLimitedProvider = vi.fn()
    mockGetClient.mockReturnValue(mockBaseProvider)
    mockLimitRegions.mockReturnValue(mockLimitedProvider)

    const result = createKmsClientProvider()

    expect(mockGetClient).toHaveBeenCalledWith('MOCK_KMS_CONSTRUCTOR', {
      region: 'eu-west-2'
    })
    expect(mockLimitRegions).toHaveBeenCalledWith(
      ['eu-west-2'],
      mockBaseProvider
    )
    expect(result).toBe(mockLimitedProvider)
  })
})
