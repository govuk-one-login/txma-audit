import {
  TEST_TEMPORARY_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_WRONG_S3_BUCKET
} from '../testConstants'

export const testS3SqsEvent = {
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
