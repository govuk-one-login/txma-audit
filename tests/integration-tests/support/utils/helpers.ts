import { Readable } from 'node:stream'

export const pause = (delay: number): Promise<unknown> => {
  return new Promise((r) => setTimeout(r, delay))
}

export const generateCurrentDateAndTimePrefix = (): string => {
  const date = new Date()
  const isoDate = date.toISOString().split('T')
  const isoDateParts = isoDate[0].split('-')
  const isoTimeParts = isoDate[1].split(':')

  const year = isoDateParts[0]
  const month = isoDateParts[1]
  const day = isoDateParts[2]
  const hour = isoTimeParts[0]

  return `firehose/${year}/${month}/${day}/${hour}`
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
