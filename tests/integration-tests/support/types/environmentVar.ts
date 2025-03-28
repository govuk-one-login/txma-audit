export interface EnvironmentVar {
  name:
    | 'AWS_REGION'
    | 'AUDIT_MESSAGE_DELIMITER_FUNCTION_NAME'
    | 'AUDIT_MESSAGE_DELIMITER_LOGS_NAME'
    | 'S3_COPY_AND_ENCRYPT_FUNCTION_NAME'
    | 'S3_COPY_AND_ENCRYPT_LOGS_NAME'
    | 'FIREHOSE_DELIVERY_STREAM_NAME'
    | 'AUDIT_BUILD_MESSAGE_BATCH_NAME'
    | 'FIREHOSE_AUDIT_MESSAGE_BATCH_NAME'
}
