import { SQSClient } from '@aws-sdk/client-sqs';
const REGION = 'eu-west-2';
const sqsClient = new SQSClient({ region: REGION });
export { sqsClient };

