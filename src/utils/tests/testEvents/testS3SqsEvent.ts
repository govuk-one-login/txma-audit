import {
  TEST_TEMPORARY_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_WRONG_S3_BUCKET,
  TEST_AUDIT_BUCKET_NAME
} from '../testConstants'

export const testTemporaryS3SqsEvent = {
  Records: [
    {
      messageId: '',
      receiptHandle: '',
      body: `{"Records":[{"eventVersion":"","eventSource":"","awsRegion":"","eventTime":"","eventName":"","userIdentity":{"principalId":""},"requestParameters":{"sourceIPAddress":""},"responseElements":{"x-amz-request-id":"","x-amz-id-2":""},"s3":{"s3SchemaVersion":"","configurationId":"","bucket":{"name":"${TEST_TEMPORARY_BUCKET_NAME}","ownerIdentity":{"principalId":""},"arn":""},"object":{"key":"${TEST_S3_OBJECT_KEY}","size":1,"eTag":"","versionId":"","sequencer":""}}}]}`,
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '',
        SenderId: '',
        ApproximateFirstReceiveTimestamp: ''
      },
      messageAttributes: {},
      md5OfBody: '',
      eventSource: '',
      eventSourceARN: '',
      awsRegion: ''
    }
  ]
}

export const testAuditS3SqsEvent = {
  Records: [
    {
      messageId: '',
      receiptHandle: '',
      body: `{"Records":[{"eventVersion":"","eventSource":"","awsRegion":"","eventTime":"","eventName":"","userIdentity":{"principalId":""},"requestParameters":{"sourceIPAddress":""},"responseElements":{"x-amz-request-id":"","x-amz-id-2":""},"s3":{"s3SchemaVersion":"","configurationId":"","bucket":{"name":"${TEST_AUDIT_BUCKET_NAME}","ownerIdentity":{"principalId":""},"arn":""},"object":{"key":"${TEST_S3_OBJECT_KEY}","size":1,"eTag":"","versionId":"","sequencer":""}}}]}`,
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '',
        SenderId: '',
        ApproximateFirstReceiveTimestamp: ''
      },
      messageAttributes: {},
      md5OfBody: '',
      eventSource: '',
      eventSourceARN: '',
      awsRegion: ''
    }
  ]
}

export const wrongBucketTestS3SqsEvent = {
  Records: [
    {
      messageId: '',
      receiptHandle: '',
      body: `{"Records":[{"eventVersion":"","eventSource":"","awsRegion":"","eventTime":"","eventName":"","userIdentity":{"principalId":""},"requestParameters":{"sourceIPAddress":""},"responseElements":{"x-amz-request-id":"","x-amz-id-2":""},"s3":{"s3SchemaVersion":"","configurationId":"","bucket":{"name":"${TEST_WRONG_S3_BUCKET}","ownerIdentity":{"principalId":""},"arn":""},"object":{"key":"${TEST_S3_OBJECT_KEY}","size":1,"eTag":"","versionId":"","sequencer":""}}}]}`,

      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '',
        SenderId: '',
        ApproximateFirstReceiveTimestamp: ''
      },
      messageAttributes: {},
      md5OfBody: '',
      eventSource: '',
      eventSourceARN: '',
      awsRegion: ''
    }
  ]
}

export const testS3TestEvent = {
  Records: [
    {
      messageId: '',
      receiptHandle: '',
      body: '{"Service":"Amazon S3","Event":"s3:TestEvent","Time":"","Bucket":"","RequestId":"","HostId":""}',
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '',
        SenderId: '',
        ApproximateFirstReceiveTimestamp: ''
      },
      messageAttributes: {},
      md5OfBody: '',
      eventSource: '',
      eventSourceARN: '',
      awsRegion: ''
    }
  ]
}
