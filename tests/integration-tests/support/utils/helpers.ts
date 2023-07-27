import { createHmac } from 'node:crypto'
import { Readable } from 'node:stream'
import mockSQSEvent from '../test-auth-event.json'
import { AuditEvent } from '../types/auditEvent'
import { NestedKeyOf } from './obfuscateSpecifiedProps'

export const pause = (delay: number): Promise<unknown> => {
  return new Promise((r) => setTimeout(r, delay))
}

export const randomMessageId = () => {
  Math.floor(Math.random() * 10000)
}

export const addRandomMessageIdToEventJSON = () => {
  mockSQSEvent.Records[0].messageId
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

export const obfuscateField = (
  value: unknown,
  hmacKey: string
): string | undefined => {
  if (value === undefined) return
  if ((value as string).length < 1) return value as string
  if (typeof value !== 'string') value = JSON.stringify(value)
  return createHmac('sha256', hmacKey)
    .update(value as string)
    .digest('hex')
}

export const obfuscateObject = (
  eventObj: Partial<AuditEvent>,
  hmacKey: string
) => {
  const newEvent = <Record<NestedKeyOf<AuditEvent>, unknown>>{}

  Object.entries(eventObj).forEach(([key, val]) => {
    if (typeof eventObj[key as NestedKeyOf<AuditEvent>] === 'object') {
      newEvent[key as NestedKeyOf<AuditEvent>] = obfuscateObject(
        val as Partial<AuditEvent>,
        hmacKey
      )
    } else {
      newEvent[key as NestedKeyOf<AuditEvent>] = obfuscateField(
        val as string,
        hmacKey
      )
    }
  })

  return newEvent
}

export const logSuccessForEventIdInLogGroup = (
  eventId: string,
  logGroupName: string
) => {
  console.log(
    `Event with eventId: ${eventId} has been successfully processed by ${logGroupName} lambda`
  )
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
