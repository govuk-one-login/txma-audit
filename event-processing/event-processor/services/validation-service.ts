import { SQSRecord } from 'aws-lambda';
import { AuditEvent } from '../protobuf/audit-event';
import { IValidationResponse } from '../models/validation-response.interface';
import _m0 from 'protobufjs/minimal';
import { IUnknownFieldsError } from '../models/unknown-fields-error.interface';
import { IUnknownFieldDetails } from '../models/unknown-field-details.interface';
import { IAuditEventUnknownFields } from '../models/audit-event-unknown-fields';
import { IUserUnknownFields } from '../models/user-unknown-fields.interface';
import { RequiredFieldsEnum } from '../enums/required-fields.enum';

export class validationService {
    static async validateSQSRecord(record: SQSRecord): Promise<IValidationResponse> {
        const message = record.body;

        return await this.isValidEventMessage(message, record.eventSourceARN);
    }

    private static async isValidEventMessage(message: string, eventSource: string): Promise<IValidationResponse> {
        const eventMessage = AuditEvent.decode(JSON.parse(message) as Uint8Array) as IAuditEventUnknownFields;

        if (
            (eventMessage._unknownFields && Object.keys(eventMessage._unknownFields).length) ||
            (eventMessage.user?._unknownFields && Object.keys(eventMessage._unknownFields).length)
        ) {
            const unknownFieldsError: IUnknownFieldsError = {
                sqsResourceName: eventSource,
                eventId: eventMessage.event_id,
                eventName: eventMessage.event_name,
                timestamp: eventMessage.timestamp?.toISOString(),
                message: 'Unknown fields in message.',
                unknownFields: [],
            };

            unknownFieldsError.unknownFields.push(...(await this.getUnknownFields(eventMessage, 'AuditEvent')));

            if (eventMessage.user) {
                unknownFieldsError.unknownFields.push(...(await this.getUnknownFields(eventMessage.user, 'User')));
            }

            console.log('[WARN] UNKNOWN FIELDS\n' + JSON.stringify(unknownFieldsError));
        }

        if (!eventMessage.event_name) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as AuditEvent) as string,
                error: {
                    sqsResourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: eventMessage.timestamp?.toISOString(),
                    requiredField: RequiredFieldsEnum.eventName,
                    message: 'event_name is a required field.',
                },
            };
        }

        if (!eventMessage.timestamp) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as AuditEvent) as string,
                error: {
                    sqsResourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: undefined,
                    requiredField: RequiredFieldsEnum.timestamp,
                    message: 'timestamp is a required field.',
                },
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
