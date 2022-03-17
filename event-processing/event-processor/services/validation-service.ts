import { SNSEventRecord, SQSRecord } from 'aws-lambda';
import { AuditEvent } from '../protobuf/audit-event';
import { IValidationResponse } from '../models/validation-response.interface';
import _m0 from 'protobufjs/minimal';
import { IUnknownFieldsWarning } from '../models/unknown-fields-warning.interface';
import { SourceTypeEnum } from '../enums/source-type.enum';
import { IEventSourceDetails } from '../models/event-source-details.interface';
import { IUnknownFieldDetails } from '../models/unknown-field-details.interface';
import { IAuditEventUnknownFields } from '../models/audit-event-unknown-fields';

export class validationService {
    static async validateSNSEventRecord(record: SNSEventRecord): Promise<IValidationResponse> {
        const message: string = record.Sns.Message;
        const eventDetails: IEventSourceDetails = {
            sourceName: record.EventSubscriptionArn,
            sourceType: SourceTypeEnum.sns,
        };

        return await this.isValidEventMessage(message, eventDetails);
    }

    static async validateSQSRecord(record: SQSRecord): Promise<IValidationResponse> {
        const message = record.body;
        const eventDetails: IEventSourceDetails = {
            sourceName: record.eventSourceARN,
            sourceType: SourceTypeEnum.sqs,
        };

        return await this.isValidEventMessage(message, eventDetails);
    }

    static isInstanceOfSNSRecord(record: SNSEventRecord | SQSRecord): record is SNSEventRecord {
        return 'Sns' in record;
    }

    private static async isValidEventMessage(
        message: string,
        eventDetails: IEventSourceDetails,
    ): Promise<IValidationResponse> {
        const eventMessage = AuditEvent.decode(JSON.parse(message) as Uint8Array);

        if ('_unknownFields' in eventMessage) {
            const unknownFieldsWarning: IUnknownFieldsWarning = {
                sourceName: eventDetails.sourceName,
                sourceType: eventDetails.sourceType,
                eventId: eventMessage.event_id,
                eventName: eventMessage.event_name,
                timeStamp: eventMessage.timestamp?.toISOString(),
                unknownFields: [],
            };

            const auditEventWithUnknownFields = eventMessage as IAuditEventUnknownFields;

            for (const key of Object.keys(auditEventWithUnknownFields._unknownFields)) {
                const values = auditEventWithUnknownFields._unknownFields[key][0] as Uint8Array;
                const reader = new _m0.Reader(values);

                const unknownField: IUnknownFieldDetails = {
                    key: key,
                    value: reader.string(),
                };

                unknownFieldsWarning.unknownFields.push(unknownField);
            }

            console.warn('[WARN] UNKNOWN FIELDS\n' + JSON.stringify(unknownFieldsWarning));
        }

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
