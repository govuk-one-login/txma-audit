import { SNSEvent } from 'aws-lambda';
import { SqsService } from './services/sqs-service';
import {IRedactedAuditEvent, RedactedAuditEvent} from "./models/redacted-event";
import {RedactedService} from "./services/redacted-service";
import {TestHelper} from "./tests/test-helpers/test-helper";
import {ErrorService} from "./services/error-service";
import {IAuditEvent} from "./models/audit-event";
export const handler = async (event: SNSEvent): Promise<void> => {

    // @ts-ignore
    const arn : string  = process.env.sqsArn;

    const region = arn.split(':')[3];
    const accountId = arn.split(':')[4];
    const queueName: string = arn.split(':')[5];

    const queueUrl = 'https://sqs.' + region + '.amazonaws.com/' + accountId + '/' + queueName;
    try {
        for (const record of event.Records) {

             const redactedMessage: IRedactedAuditEvent = RedactedService.applyRedaction(record.Sns.Message);
              await SqsService.sendMessageToSQS(redactedMessage, queueUrl);
        }
    }catch(error){
        const errorWithMessage = ErrorService.toErrorWithMessage(error);
        console.log('ERROR SQS Publish :\n Error: ${errorWithMessage.message}', errorWithMessage.stack);
        throw error;
    }

    return;
};
