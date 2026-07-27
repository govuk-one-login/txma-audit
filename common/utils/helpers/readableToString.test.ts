import { describe, it, expect } from 'vitest'
import { Readable } from 'stream'
import { readableToString } from './readableToString'

describe('readableToString', () => {
  it('converts a readable stream to a UTF-8 string', async () => {
    // Unit Test
    const testData = 'hello world'
    const readable = new Readable()
    readable.push(testData)
    readable.push(null)

    const result = await readableToString(readable)

    expect(result).toBe(testData)
  })

  it('handles multi-chunk streams', async () => {
    // Unit Test
    const readable = new Readable()
    readable.push('chunk1')
    readable.push('chunk2')
    readable.push('chunk3')
    readable.push(null)

    const result = await readableToString(readable)

    expect(result).toBe('chunk1chunk2chunk3')
  })

  it('handles an empty stream', async () => {
    // Unit Test
    const readable = new Readable()
    readable.push(null)

    const result = await readableToString(readable)

    expect(result).toBe('')
  })
})
