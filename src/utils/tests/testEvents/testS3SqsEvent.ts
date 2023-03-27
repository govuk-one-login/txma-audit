export const testS3SqsEvent = (bucketName: string, objectKey: string) => ({
  Records: [
    {
      messageId: '',
      receiptHandle: '',
      body: `{"Records":[{"eventVersion":"","eventSource":"","awsRegion":"","eventTime":"","eventName":"","userIdentity":{"principalId":""},"requestParameters":{"sourceIPAddress":""},"responseElements":{"x-amz-request-id":"","x-amz-id-2":""},"s3":{"s3SchemaVersion":"","configurationId":"","bucket":{"name":"${bucketName}","ownerIdentity":{"principalId":""},"arn":""},"object":{"key":"${objectKey}","size":1,"eTag":"","versionId":"","sequencer":""}}}]}`,
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
})

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
