import { AuditEvent } from '../types/auditEvent'
import { obfuscateObject } from './helpers'

export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

export const pick = (
  eventObj: AuditEvent,
  keys: NestedKeyOf<AuditEvent>[]
): Partial<AuditEvent> =>
  Object.fromEntries(
    keys.filter((key) => key in eventObj).map((key) => [key, eventObj[key]])
  )

export const obfuscateSpecifiedProps = (
  eventObject: AuditEvent,
  requiredProps: NestedKeyOf<AuditEvent>[],
  hmackey: string
) => obfuscateObject(pick(eventObject, requiredProps), hmackey)
