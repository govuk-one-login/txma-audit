import { SNSEventRecord, SQSRecord } from 'aws-lambda';
import { IAuditEvent, AuditEvent } from '../models/audit-event';
import { IValidationResponse } from '../models/validation-response.interface';
import { IUnknownFieldsError } from '../models/unknown-fields-error.interface';
import { IAuditEventUnknownFields } from '../models/audit-event-unknown-fields';
import { IUserUnknownFields } from '../models/user-unknown-fields.interface';
import { RequiredFieldsEnum } from '../enums/required-fields.enum';
import { IUnknownFieldDetails } from '../models/unknown-field-details.interface';

// @ts-ignore
export class ValidationService {
    static async validateSQSRecord(record: SQSRecord): Promise<IValidationResponse> {
        const message = record.body;
        return await this.isValidEventMessage(message, record.eventSourceARN, 'NONE');
    }

    static async validateSNSRecordForAccounts(record: SNSEventRecord): Promise<IValidationResponse> {
        const message = record.Sns.Message;

        return await this.isValidEventMessage(message, record.EventSubscriptionArn, 'ACCOUNTS');
    }

    static async validateSNSRecordForBilling(record: SNSEventRecord): Promise<IValidationResponse> {
        const message = record.Sns.Message;
        console.log("Message body " + message);


        return await this.isValidEventMessage(message, record.EventSubscriptionArn, 'BILLING');
    }

    private static async isValidEventMessage(
        message: string,
        eventSource: string,
        validationFor: string,
    ): Promise<IValidationResponse> {
        console.log('ValidationFor value ' + validationFor);
        const eventMessage = AuditEvent.fromJSONString(message) as IAuditEventUnknownFields;
        const eventMessageUser = eventMessage.user as IUserUnknownFields;
        if (
            (eventMessage._unknownFields && eventMessage._unknownFields.size > 0) ||
            (eventMessageUser?._unknownFields && eventMessageUser?._unknownFields.size > 0)
        ) {
            const unknownFieldsError: IUnknownFieldsError = {
                resourceName: eventSource,
                eventId: eventMessage.event_id,
                eventName: eventMessage.event_name,
                timestamp: eventMessage.timestamp.toString(),
                message: 'Unknown fields in message.',
                unknownFields: [],
            };

            if (eventMessage._unknownFields && eventMessage._unknownFields.size > 0)
                unknownFieldsError.unknownFields.push(...(await this.getUnknownFields(eventMessage, 'AuditEvent')));

            if (eventMessageUser && eventMessageUser?._unknownFields && eventMessageUser?._unknownFields.size > 0)
                unknownFieldsError.unknownFields.push(...(await this.getUnknownFields(eventMessageUser, 'User')));

            console.log('[WARN] UNKNOWN FIELDS\n' + JSON.stringify(unknownFieldsError));
        }

        if (!eventMessage.event_name) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as IAuditEvent),
                error: {
                    resourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: eventMessage.timestamp.toString(),
                    requiredField: RequiredFieldsEnum.eventName,
                    message: 'event_name is a required field.',
                },
            };
        }

        if (!eventMessage.timestamp || !this.isDate(eventMessage.timestamp)) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as IAuditEvent),
                error: {
                    resourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: undefined,
                    requiredField: RequiredFieldsEnum.timestamp,
                    message: 'timestamp is a required field.',
                },
            };
        }

        if ((validationFor.localeCompare('ACCOUNTS') ==0 || validationFor.localeCompare('BILLING') ==0) && !eventMessage.timestamp_formatted ) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as IAuditEvent),
                error: {
                    resourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: undefined,
                    requiredField: RequiredFieldsEnum.timestampFormatted,
                    message: 'timestamp_formatted is a required field.',
                },
            };
        }

        if ((validationFor.localeCompare('ACCOUNTS') ==0 || validationFor.localeCompare('BILLING') ==0) && !eventMessage.client_id) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as IAuditEvent),
                error: {
                    resourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: eventMessage.timestamp.toString(),
                    requiredField: RequiredFieldsEnum.clientId,
                    message: 'client_id is a required field.',
                },
            };
        }

        if (validationFor.localeCompare('BILLING') ==0 && !eventMessage.component_id) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as IAuditEvent),
                error: {
                    resourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: eventMessage.timestamp.toString(),
                    requiredField: RequiredFieldsEnum.componentId,
                    message: 'component_id is a required field.',
                },
            };
        }

        if (validationFor.localeCompare('ACCOUNTS') ==0  && !eventMessage.user?.user_id) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as IAuditEvent),
                error: {
                    resourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: eventMessage.timestamp.toString(),
                    requiredField: RequiredFieldsEnum.userId,
                    message: 'user_id is a required field.',
                },
            };
        }

        if (validationFor.localeCompare('ACCOUNTS') ==0  && !eventMessage.user?.govuk_signin_journey_id) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as IAuditEvent),
                error: {
                    resourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: eventMessage.timestamp.toString(),
                    requiredField: RequiredFieldsEnum.journeyId,
                    message: 'govuk_signin_journey_id is a required field.',
                },
            };
        }

        if ( validationFor.localeCompare('BILLING') ==0 && !eventMessage.user?.transaction_id) {
            return {
                isValid: false,
                message: AuditEvent.toJSON(eventMessage as IAuditEvent),
                error: {
                    resourceName: eventSource,
                    eventId: eventMessage.event_id,
                    eventName: eventMessage.event_name,
                    timestamp: eventMessage.timestamp.toString(),
                    requiredField: RequiredFieldsEnum.transactionId,
                    message: 'transaction_id is a required field.',
                },
            };
        }


        return {
            isValid: true,
            message: AuditEvent.toJSON(eventMessage as IAuditEvent),
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

    private static isDate = (timestamp: number): boolean => {
        return new Date(timestamp * 1000).getTime() > 0;
    };

}
