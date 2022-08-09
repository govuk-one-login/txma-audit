import { IAuditEvent } from '../models/audit-event';
import { ObjectHelper } from '../utilities/object-helper';
import { PublishCommand, PublishCommandOutput, SNSClient } from '@aws-sdk/client-sns';
import { ErrorService } from './error-service';

export class SnsService {
    static client = new SNSClient({ region: 'eu-west-2' });

    static async publishMessageToSNS(message: IAuditEvent, topicArn: string | undefined): Promise<void> {
        console.log(`Topic ARN: ${topicArn}`);

        const cleanMessage = ObjectHelper.removeEmpty(message);

        try {
            const publishResponse: PublishCommandOutput = await this.client.send(
                new PublishCommand({
                    Message: JSON.stringify(cleanMessage),
                    TopicArn: topicArn,
                    MessageAttributes: {
                        eventName: {
                            DataType: 'String',
                            StringValue: message.event_name,
                        },
                    },
                }),
            );

            if (publishResponse.MessageId) {
                console.log('MessageID is ' + publishResponse.MessageId);
            }
        } catch (error) {
            const errorWithMessage = ErrorService.toErrorWithMessage(error);
            console.log(`[ERROR] Publish to SNS error:\n Error: ${errorWithMessage.message}`, errorWithMessage.stack);
            throw error;
        }

        return;
    }
}
