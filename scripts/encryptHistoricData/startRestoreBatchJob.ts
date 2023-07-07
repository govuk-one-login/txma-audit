import {
  S3ControlClient,
  CreateJobCommand,
  CreateJobCommandInput,
  JobReportScope
} from '@aws-sdk/client-s3-control'
import { getEnv } from '../../src/utils/helpers/getEnv'
import { writeJobManifestFile } from './writeJobManifestFile'

export const startRestoreBatchJob = async (s3FileKeys: string[]) => {
  if (s3FileKeys.length === 0) {
    console.log(
      'Not starting restore batch job because there were no files to restore'
    )
    return
  }
  console.log(`Start restore batch job for ${s3FileKeys.length} files`)

  const manifestFileName = `historial-encrypt-glacier-job-${Date.now()}.csv`
  const manifestFileEtag = await writeJobManifestFile(
    getEnv('LEGACY_AUDIT_BUCKET_NAME'),
    s3FileKeys,
    manifestFileName
  )
  const jobId = await createRestoreBatchJob(manifestFileName, manifestFileEtag)

  console.log('Started restore batch job', { jobId })
}

const createRestoreBatchJob = async (
  manifestFileName: string,
  manifestFileEtag: string
) => {
  const client = new S3ControlClient({ region: getEnv('AWS_REGION') })
  const input = {
    ConfirmationRequired: false,
    AccountId: getEnv('AWS_ACCOUNT_ID'),
    RoleArn: getEnv('BATCH_JOB_ROLE_ARN'),
    Priority: 1,
    Operation: {
      S3InitiateRestoreObject: {
        ExpirationInDays: 1,
        GlacierJobTier: 'BULK'
      }
    },
    Report: {
      Enabled: true,
      Bucket: getEnv('BATCH_JOB_MANIFEST_BUCKET_ARN'),
      Prefix: 'historic-encryption-restore-reports',
      Format: 'Report_CSV_20180820',
      ReportScope: JobReportScope.FailedTasksOnly
    },
    Manifest: {
      Spec: {
        Format: 'S3BatchOperations_CSV_20180820',
        Fields: ['Bucket', 'Key']
      },
      Location: {
        ObjectArn: `${getEnv(
          'BATCH_JOB_MANIFEST_BUCKET_ARN'
        )}/${manifestFileName}`,
        ETag: manifestFileEtag
      }
    }
  } as CreateJobCommandInput
  const result = await client.send(new CreateJobCommand(input))
  return result.JobId
}
