import { Readable } from 'node:stream'

export const pause = (delay: number): Promise<unknown> => {
  return new Promise((r) => setTimeout(r, delay))
}

// Firehose delivery can be delayed past an hour boundary, so returns the current
// hour's prefix plus `hoursToLookBack` preceding hours (oldest last), using UTC
// millisecond arithmetic so day/month/year rollover is handled automatically.
export const generateCurrentDateAndTimePrefixes = (
  hoursToLookBack = 1
): string[] => {
  const now = Date.now()
  const prefixes: string[] = []

  for (let hoursAgo = 0; hoursAgo <= hoursToLookBack; hoursAgo++) {
    const date = new Date(now - hoursAgo * 60 * 60 * 1000)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hour = String(date.getUTCHours()).padStart(2, '0')

    prefixes.push(`firehose/${year}/${month}/${day}/${hour}`)
  }

  return prefixes
}

export const readableToString = async (readable: Readable) => {
  const result = []

  for await (const chunk of readable) {
    result.push(Buffer.from(chunk))
  }

  return Buffer.concat(result).toString('utf-8')
}

export const exponentialBackoff = (
  retryCount: number,
  backoffFactor: number
): number => {
  const baseDelay = 1000 // Initial delay in milliseconds
  const maxDelay = 60000 // Maximum delay in milliseconds

  const delay = Math.pow(backoffFactor, retryCount) * baseDelay
  return Math.min(delay, maxDelay)
}
