import { config, SNS } from 'aws-sdk';
import { IAuditEvent } from '../models/audit-event';
import { PublishInput } from 'aws-sdk/clients/sns';

export class SnsService {
    static async publishMessageToSNS(message: IAuditEvent, topicArn: string | undefined): Promise<void> {
        console.log(`Topic ARN: ${topicArn}`);

        config.update({ region: process.env.AWS_REGION });
        
        let cleanMessage = this.removeEmpty(message);

        const params: PublishInput = {
            Message: JSON.stringify(cleanMessage),
            TopicArn: topicArn,
            MessageAttributes: {
                eventName: {
                    DataType: 'String',
                    StringValue: message.event_name,
                },
            },
        };

        const sns = new SNS({ apiVersion: '2010-03-31' });

        const publishTextPromise = sns.publish(params).promise();

        await publishTextPromise
            .then((data) => {
                console.log('MessageID is ' + data.MessageId);
            })
            .catch((err) => {
                console.error(err, err.stack);
            });

        return;
    }

    public static removeEmpty(obj : any) : unknown {
        for (var propName in obj) {
          if (obj[propName] === null || obj[propName] === undefined  || obj[propName] == "") {
            delete obj[propName];
          } else if(obj[propName] === typeof Array) {
            obj[propName].forEach((value : Object, index: string | number) => {
                obj[propName][index] = this.removeEmpty(value);
            });
          } else if(obj[propName] === typeof Object) {
            obj[propName] = this.removeEmpty(obj[propName]);
          }
        }
        return obj
    }
}
