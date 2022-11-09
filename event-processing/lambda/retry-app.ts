import {SNSEvent, SQSEvent} from 'aws-lambda';
import { SqsService } from './services/sqs-service';
import {IRedactedAuditEvent, RedactedAuditEvent} from "./models/redacted-event";
import {RedactedService} from "./services/redacted-service";
import {TestHelper} from "./tests/test-helpers/test-helper";
import {ErrorService} from "./services/error-service";
import {S3Service} from "./services/s3-service";
export const handler = async (event:SQSEvent): Promise<void> => {
    console.log('[INFO] Retry Function has been Called!');
    // @ts-ignore
    const arn :string  = process.env.publishToAccountsARN;
    const maxRetryAttempt : number  = Number(process.env.maxRetry);
    // @ts-ignore
    const failureBucketARN : string  =  process.env.publishToAccountsFailureBucketARN;
    const failureBucketName: string = failureBucketARN.split(':')[5];
    const region = arn.split(':')[3];
    const accountId = arn.split(':')[4];
    const queueName: string = arn.split(':')[5];
    const queueUrl = 'https://sqs.' + region + '.amazonaws.com/' + accountId + '/' + queueName;
    let data: string;
    for (const record of event.Records) {
        const msgbody = record.body;
        console.log('Message Id ' + record.messageId);
        const redactedEvent: IRedactedAuditEvent = RedactedAuditEvent.fromJSONString(msgbody);
        if (redactedEvent.reIngestCount == undefined || redactedEvent.reIngestCount == 0 || redactedEvent.reIngestCount < maxRetryAttempt) {
            redactedEvent.reIngestCount = redactedEvent.reIngestCount + 1;
            await SqsService.sendMessageToSQS(RedactedService.redactedEvent(redactedEvent), queueUrl);
        }else  {
            console.log(
                'SQS MAX ATTEMPT RETRY FAILED\n' +
                'Max Attempt ' + maxRetryAttempt + ' reached for Message Id ' + record.messageId);
            await S3Service.putObject(failureBucketName, record.messageId , msgbody );

        }
    }
    return;
}


