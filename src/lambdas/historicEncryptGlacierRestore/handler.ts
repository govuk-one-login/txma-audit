import { Context, S3ObjectRestoreCompletedNotificationEvent } from 'aws-lambda'
import { initialiseLogger } from '../../services/logger'
import { encryptAuditData } from '../../sharedServices/encryptAuditData'

export const handler = async (
  event: S3ObjectRestoreCompletedNotificationEvent,
  context: Context
) => {
  initialiseLogger(context)
  await encryptAuditData(event.detail.bucket.name, event.detail.object.key)
}
