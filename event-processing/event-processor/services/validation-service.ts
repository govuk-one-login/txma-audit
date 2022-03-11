import { SNSEventRecord, SQSRecord } from 'aws-lambda';
import { EventMessage } from '../protobuf/event-message';
import { IValidationResponse } from '../models/validation-response.interface';

export class validationService {
    static async validateSNSEventRecord(record: SNSEventRecord): Promise<IValidationResponse> {
        const message = record.Sns.Message;
        const eventMessage = EventMessage.fromJSON(message);

        return await this.isValidEventMessage(eventMessage);
    }

    static async validateSQSRecord(record: SQSRecord): Promise<IValidationResponse> {
        const message = record.body;
        const eventMessage = EventMessage.fromJSON(message);

        return await this.isValidEventMessage(eventMessage);
    }

    static isInstanceOfSNSRecord(record: SNSEventRecord | SQSRecord): record is SNSEventRecord {
        return 'Sns' in record;
    }

    private static async isValidEventMessage(eventMessage: EventMessage): Promise<IValidationResponse> {
        if (!eventMessage.eventName) {
            return {
                isValid: false,
                message: 'eventName is a required field.',
            };
        }

        if (!eventMessage.timestamp) {
            return {
                isValid: false,
                message: 'timestamp is a required field.',
            };
        }

        return {
            isValid: true,
        };
    }
}
