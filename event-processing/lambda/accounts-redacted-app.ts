import { SNSEvent, SNSEventRecord, SQSRecord } from 'aws-lambda';
import { SqsService } from './services/sqs-service';
import { IRedactedAuditEvent } from './models/redacted-event-accounts';
import { RedactedService } from './services/redacted-service';
import { ErrorService } from './services/error-service';
import { ValidationService } from './services/validation-service';
import { ValidationException } from './exceptions/validation-exception';
import { IRequiredFieldError } from './models/required-field-error.interface';
import { S3Service } from './services/s3-service';
export const handler = async (event: SNSEvent): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const arn: string = process.env.publishToAccountsARN;

    const region = arn.split(':')[3];
    const accountId = arn.split(':')[4];
    const queueName: string = arn.split(':')[5];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const failureBucketARN: string = process.env.publishToAccountsFailureBucketARN;
    const failureBucketName: string = failureBucketARN.split(':')[5];

    const queueUrl = 'https://sqs.' + region + '.amazonaws.com/' + accountId + '/' + queueName;
    try {
        for (const record of event.Records) {
            try {
                const validationResponse = await ValidationService.validateSNSRecordForAccounts(record as SNSEventRecord);
                if (!validationResponse.isValid) {
                    console.log(
                        '[ERROR] VALIDATION ERROR\n' +
                            JSON.stringify(
                                new ValidationException(
                                    'An event message failed validation.',
                                    validationResponse.error as IRequiredFieldError,
                                ),
                            ),
                    );
                    await S3Service.putObject(failureBucketName, record.Sns.MessageId, record.Sns.Message);
                } else {
                    const redactedMessage: IRedactedAuditEvent = RedactedService.applyRedactionForAccounts(
                        record.Sns.Message,
                    );
                    console.log('Message Id ' + record.Sns.MessageId);
                    await SqsService.sendMessageToSQS(redactedMessage.event_name, redactedMessage, queueUrl);
                }
            } catch (error) {
                const errorWithMessage = ErrorService.toErrorWithMessage(error);
                console.log(
                    '[ERROR] SQS Message Publish ERROR :\n  ${errorWithMessage.message}',
                    errorWithMessage.stack,
                );
                await S3Service.putObject(failureBucketName, record.Sns.MessageId, record.Sns.Message);
                throw error;
            }
        }
    } catch (error) {
        const errorWithMessage = ErrorService.toErrorWithMessage(error);
        console.log('[ERROR] SQS Publish ERROR :\n  ${errorWithMessage.message}', errorWithMessage.stack);
        throw error;
    }
    return;
};
