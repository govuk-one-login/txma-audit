import { SNSEvent } from 'aws-lambda';
import { SqsService } from './services/sqs-service';
import {IRedactedAuditEvent} from "./models/redacted-event";
import {RedactedService} from "./services/redacted-service";
import {TestHelper} from "./tests/test-helpers/test-helper";
export const handler = async (event: SNSEvent): Promise<void> => {

    const arn = process.env.sqsArn;

    const region = arn.split(':')[3];
    const accountId = arn.split(':')[4];
    const queueName: string = arn.split(':')[5];

    const queueUrl = 'https://sqs.' + region + '.amazonaws.com/' + accountId + '/' + queueName;

    for (const record of event.Records) {
        const redactedMessages: IRedactedAuditEvent[] = RedactedService.applyRedaction(record.Sns.Message);
        for (const k in redactedMessages) {
            await SqsService.sendMessageToSQS(redactedMessages[k], queueUrl);
        }
    }

    return;
};
