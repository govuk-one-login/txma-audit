import { describe, it, expect, vi } from 'vitest'
import { tryParseJSON } from './tryParseJson'

vi.mock('../../../common/sharedServices/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

describe('tryParseJSON', () => {
  it('parses valid JSON and returns the parsed object', () => {
    // Unit Test
    const input = JSON.stringify({ event_name: 'test', timestamp: 123 })

    const result = tryParseJSON(input)

    expect(result).toEqual({ event_name: 'test', timestamp: 123 })
  })

  it('returns an empty object when given invalid JSON', () => {
    // Unit Test
    const result = tryParseJSON('not valid json {{{')

    expect(result).toEqual({})
  })

  it('returns an empty object when given an empty string', () => {
    // Unit Test
    const result = tryParseJSON('')

    expect(result).toEqual({})
  })
})
