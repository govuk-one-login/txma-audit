import { SQSRecord } from 'aws-lambda';
import { IAuditEvent, AuditEvent } from '../models/audit-event';
import { IValidationResponse } from '../models/validation-response.interface';
import { IUnknownFieldsError } from '../models/unknown-fields-error.interface';
import { IAuditEventUnknownFields } from '../models/audit-event-unknown-fields';
import { IUserUnknownFields } from '../models/user-unknown-fields.interface';
import { RequiredFieldsEnum } from '../enums/required-fields.enum';
import { IUnknownFieldDetails } from '../models/unknown-field-details.interface';

export class validationService {
    static async validateSQSRecord(record: SQSRecord): Promise<IValidationResponse> {
        const message = record.body;

        return await this.isValidEventMessage(message, record.eventSourceARN);
    }

    private static async isValidEventMessage(message: string, eventSource: string): Promise<IValidationResponse> {
        const eventMessage = AuditEvent.fromJSONString(message) as IAuditEventUnknownFields;
        const eventMessageUser = eventMessage.user as IUserUnknownFields;
        if (
            (eventMessage._unknownFields && eventMessage._unknownFields.size > 0) ||
            (eventMessageUser?._unknownFields && eventMessageUser?._unknownFields.size > 0)
        ) {
            const unknownFieldsError: IUnknownFieldsError = {
                sqsResourceName: eventSource,
                eventId: eventMessage.event_id,
                eventName: eventMessage.event_name,
                timestamp: eventMessage.timestamp.toString(),
                message: 'Unknown fields in message.',
                unknownFields: [],
            };

            unknownFieldsError.unknownFields.push(...(await this.getUnknownFields(eventMessage, 'AuditEvent')));

            if (eventMessage.user) {
                unknownFieldsError.unknownFields.push(...(await this.getUnknownFields(eventMessageUser, 'User')));
            }

            console.log('[WARN] UNKNOWN FIELDS\n' + JSON.stringify(unknownFieldsError));
        }

        if (!eventMessage.event_name) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as IAuditEvent) as string,
                error: {
                    sqsResourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: eventMessage.timestamp.toString(),
                    requiredField: RequiredFieldsEnum.eventName,
                    message: 'event_name is a required field.',
                },
            };
        }

        if (!eventMessage.timestamp) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as IAuditEvent) as string,
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
            eventMessage.timestamp_formatted = new Date(eventMessage.timestamp * 1000).toISOString();
        }

        return {
            isValid: true,
            message: AuditEvent.toJSON(eventMessage as IAuditEvent) as string,
        };
    }

    private static async getUnknownFields(
        model: IAuditEventUnknownFields | IUserUnknownFields,
        fieldName: string,
    ): Promise<IUnknownFieldDetails[]> {
        const unknownFields = Array<IUnknownFieldDetails>();

        model._unknownFields.forEach((value, key) => {
            const unknownField: IUnknownFieldDetails = {
                key: key,
                fieldName: fieldName,
            };

            unknownFields.push(unknownField);
        });

        return unknownFields;
    }
}
