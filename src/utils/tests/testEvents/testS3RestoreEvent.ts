import {
  TEST_AUDIT_BUCKET_ARN,
  TEST_AUDIT_BUCKET_NAME,
  TEST_S3_OBJECT_KEY
} from '../testConstants'

export const testS3RestoreEvent = {
  Records: [
    {
      eventVersion: '',
      eventSource: '',
      awsRegion: '',
      eventTime: '',
      eventName: '',
      userIdentity: { principalId: '' },
      requestParameters: { sourceIPAddress: '' },
      responseElements: { 'x-amz-request-id': '', 'x-amz-id-2': '' },
      s3: {
        s3SchemaVersion: '',
        configurationId: '',
        bucket: {
          name: TEST_AUDIT_BUCKET_NAME,
          ownerIdentity: { principalId: '' },
          arn: TEST_AUDIT_BUCKET_ARN
        },
        object: {
          key: TEST_S3_OBJECT_KEY,
          size: 1,
          eTag: '',
          versionId: '',
          sequencer: ''
        }
      }
    }
  ]
}
