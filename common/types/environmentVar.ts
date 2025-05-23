export interface EnvironmentVar {
  name:
    | 'AUDIT_BUCKET_NAME'
    | 'AUDIT_PERMANENT_BUCKET_NAME'
    | 'AUDIT_TEMPORARY_BUCKET_NAME'
    | 'AWS_ACCOUNT_ID'
    | 'AWS_REGION'
    | 'FIREHOSE_DELIVERY_STREAM_NAME'
    | 'GENERATOR_KEY_ID'
    | 'AUDIT_MESSAGE_DELIMITER_FUNCTION_NAME'
    | 'AUDIT_MESSAGE_DELIMITER_LOGS_NAME'
    | 'S3_COPY_AND_ENCRYPT_FUNCTION_NAME'
    | 'S3_COPY_AND_ENCRYPT_LOGS_NAME'
    | 'AUDIT_BUILD_MESSAGE_BATCH_NAME'
    | 'FIREHOSE_AUDIT_MESSAGE_BATCH_NAME'
}
