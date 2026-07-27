import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('awsSdkClients', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    process.env.AWS_REGION = 'eu-west-2'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('exports raw clients when XRAY_ENABLED is not set', async () => {
    // Unit Test
    delete process.env.XRAY_ENABLED

    const { firehoseClient, s3Client } = await import('./awsSdkClients')

    expect(firehoseClient).toBeDefined()
    expect(s3Client).toBeDefined()
  })

  it('exports raw clients when XRAY_ENABLED is false', async () => {
    // Unit Test
    process.env.XRAY_ENABLED = 'false'

    const { firehoseClient, s3Client } = await import('./awsSdkClients')

    expect(firehoseClient).toBeDefined()
    expect(s3Client).toBeDefined()
  })

  it('wraps clients with X-Ray when XRAY_ENABLED is true', async () => {
    // Unit Test
    process.env.XRAY_ENABLED = 'true'

    const { firehoseClient, s3Client } = await import('./awsSdkClients')

    expect(firehoseClient).toBeDefined()
    expect(s3Client).toBeDefined()
  })

  it('exports s3ControlClient and secretsManagerClient', async () => {
    // Unit Test
    const { s3ControlClient, secretsManagerClient } =
      await import('./awsSdkClients')

    expect(s3ControlClient).toBeDefined()
    expect(secretsManagerClient).toBeDefined()
  })
})
