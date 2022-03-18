import { SQSRecord } from 'aws-lambda';
import { AuditEvent } from '../protobuf/audit-event';
import { IValidationResponse } from '../models/validation-response.interface';
import _m0 from 'protobufjs/minimal';
import { IUnknownFieldsWarning } from '../models/unknown-fields-warning.interface';
import { SourceTypeEnum } from '../enums/source-type.enum';
import { IEventSourceDetails } from '../models/event-source-details.interface';
import { IUnknownFieldDetails } from '../models/unknown-field-details.interface';
import { IAuditEventUnknownFields } from '../models/audit-event-unknown-fields';
import { IUserUnknownFields } from '../models/user-unknown-fields.interface';

export class validationService {
    static async validateSQSRecord(record: SQSRecord): Promise<IValidationResponse> {
        const message = record.body;
        const eventDetails: IEventSourceDetails = {
            sourceName: record.eventSourceARN,
            sourceType: SourceTypeEnum.sqs,
        };

        return await this.isValidEventMessage(message, eventDetails);
    }

    private static async isValidEventMessage(
        message: string,
        eventDetails: IEventSourceDetails,
    ): Promise<IValidationResponse> {
        const eventMessage = AuditEvent.decode(JSON.parse(message) as Uint8Array) as IAuditEventUnknownFields;

        if (
            (eventMessage._unknownFields && Object.keys(eventMessage._unknownFields).length) ||
            (eventMessage.user?._unknownFields && Object.keys(eventMessage._unknownFields).length)
        ) {
            const unknownFieldsWarning: IUnknownFieldsWarning = {
                sourceName: eventDetails.sourceName,
                sourceType: eventDetails.sourceType,
                eventId: eventMessage.event_id,
                eventName: eventMessage.event_name,
                timeStamp: eventMessage.timestamp?.toISOString(),
                unknownFields: [],
            };

            unknownFieldsWarning.unknownFields.push(...(await this.getUnknownFields(eventMessage, 'AuditEvent')));

            if (eventMessage.user) {
                unknownFieldsWarning.unknownFields.push(...(await this.getUnknownFields(eventMessage.user, 'User')));
            }

            console.warn('[WARN] UNKNOWN FIELDS\n' + JSON.stringify(unknownFieldsWarning));
        }

        if (!eventMessage.event_name) {
            return {
                isValid: false,
                error: 'eventName is a required field.',
                message: AuditEvent.toJSON(eventMessage as AuditEvent) as string,
            };
        }

        if (!eventMessage.timestamp) {
            return {
                isValid: false,
                error: 'timestamp is a required field.',
                message: AuditEvent.toJSON(eventMessage as AuditEvent) as string,
            };
        }

        if (!eventMessage.timestamp_formatted) {
            eventMessage.timestamp_formatted = eventMessage.timestamp.toISOString();
        }

        return {
            isValid: true,
            message: AuditEvent.toJSON(eventMessage as AuditEvent) as string,
        };
    }

    private static async getUnknownFields(
        model: IAuditEventUnknownFields | IUserUnknownFields,
        fieldName: string,
    ): Promise<IUnknownFieldDetails[]> {
        const unknownFields = Array<IUnknownFieldDetails>();

        for (const key of Object.keys(model._unknownFields)) {
            const values = model._unknownFields[key][0] as Uint8Array;
            const reader = new _m0.Reader(values);

            const unknownField: IUnknownFieldDetails = {
                key: key,
                value: reader.string(),
                fieldName: fieldName,
            };

            unknownFields.push(unknownField);
        }

        return unknownFields;
    }
}
