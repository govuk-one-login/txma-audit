import { SNSEvent, SNSEventRecord, SQSRecord } from 'aws-lambda';
import { SqsService } from './services/sqs-service';
import { IRedactedAuditEvent } from './models/redacted-event';
import { AccountsRedactedService } from './services/redacted-service';
import { ErrorService } from './services/error-service';
import { ValidationService } from './services/validation-service';
import { ValidationException } from './exceptions/validation-exception';
import { IRequiredFieldError } from './models/required-field-error.interface';
export const handler = async (event: SNSEvent): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const arn: string = process.env.publishToAccountsARN;

    const region = arn.split(':')[3];
    const accountId = arn.split(':')[4];
    const queueName: string = arn.split(':')[5];

    const queueUrl = 'https://sqs.' + region + '.amazonaws.com/' + accountId + '/' + queueName;
    try {
        for (const record of event.Records) {
            const validationResponse = await ValidationService.validateSNSRecord(record as SNSEventRecord);
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
            } else {
                const redactedMessage: IRedactedAuditEvent = AccountsRedactedService.applyRedaction(record.Sns.Message);
                console.log('Message Id ' + record.Sns.MessageId);
                await SqsService.sendMessageToSQS(redactedMessage, queueUrl);
            }
        }
    } catch (error) {
        const errorWithMessage = ErrorService.toErrorWithMessage(error);
        console.log('[ERROR] SQS Publish ERROR :\n  ${errorWithMessage.message}', errorWithMessage.stack);
        throw error;
    }

    return;
};
