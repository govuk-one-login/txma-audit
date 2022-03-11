import { SNSEvent, SQSEvent } from 'aws-lambda';

export type Event = SQSEvent | SNSEvent;
