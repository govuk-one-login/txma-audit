import { ObjectHelper } from '../utilities/object-helper';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { ErrorService } from './error-service';
import { IRedactedAuditEvent } from '../models/redacted-event';

export class SqsService {
    static sqsClient = new SQSClient({ region: 'eu-west-2' });
    static async sendMessageToSQS(eventName:string, message: unknown, queueURL: string | undefined): Promise<void> {
        const cleanMessage = ObjectHelper.removeEmpty(message);
        const params = {
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: eventName,
                },
                MaxNumberOfMessages: {
                    DataType: 'Number',
                    StringValue: '10',
                },
                VisibilityTimeout: {
                    DataType: 'Number',
                    StringValue: '30',
                },
                WaitTimeSeconds: {
                    DataType: 'Number',
                    StringValue: '0',
                },
            },
            MessageBody: JSON.stringify(cleanMessage),
            QueueUrl: queueURL,
        };
        const run = async () => {
            try {
                const data = await this.sqsClient.send(new SendMessageCommand(params));
                console.log('SQS Response Success' + data.MessageId);
            } catch (error) {
                const errorWithMessage = ErrorService.toErrorWithMessage(error);
                console.log('ERROR SQS Publish :\n Error: ${errorWithMessage.message}', errorWithMessage.stack);
                //throw error;
            }
        };
        await run();
        return;
    }
}
