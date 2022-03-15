import { SNSEventRecord, SQSRecord } from 'aws-lambda';
import { AuditEvent } from '../protobuf/audit-event';
import { IValidationResponse } from '../models/validation-response.interface';

export class validationService {
    static async validateSNSEventRecord(record: SNSEventRecord): Promise<IValidationResponse> {
        const message = record.Sns.Message;

        return await this.isValidEventMessage(message);
    }

    static async validateSQSRecord(record: SQSRecord): Promise<IValidationResponse> {
        const message = record.body;

        return await this.isValidEventMessage(message);
    }

    static isInstanceOfSNSRecord(record: SNSEventRecord | SQSRecord): record is SNSEventRecord {
        return 'Sns' in record;
    }

    private static async isValidEventMessage(message: string): Promise<IValidationResponse> {
        const eventMessage = AuditEvent.decode(JSON.parse(message) as Uint8Array);

        if (!eventMessage.event_name) {
            return {
                isValid: false,
                error: 'eventName is a required field.',
                message: AuditEvent.toJSON(eventMessage) as string,
            };
        }

        if (!eventMessage.timestamp) {
            return {
                isValid: false,
                error: 'timestamp is a required field.',
                message: AuditEvent.toJSON(eventMessage) as string,
            };
        }

        return {
            isValid: true,
            message: AuditEvent.toJSON(eventMessage) as string,
        };
    }
}
