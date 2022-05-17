import { config, SNS } from 'aws-sdk';

export class SnsService {
    static async publishMessageToSNS(message: string, topicArn: string | undefined): Promise<void> {
        console.log(`Topic ARN: ${topicArn}`);

        config.update({ region: process.env.AWS_REGION });

        const params = {
            Message: message,
            TopicArn: topicArn,
        };

        const sns = new SNS({ apiVersion: '2010-03-31' });

        const publishTextPromise = sns.publish(params).promise();

        await publishTextPromise
            .then((data) => {
                console.log(`Message ${params.Message} send sent to the topic ${params.TopicArn}`);
                console.log('MessageID is ' + data.MessageId);
            })
            .catch((err) => {
                console.error(err, err.stack);
            });

        return;
    }
}
