import {
    FirehoseRecordTransformationStatus,
    FirehoseTransformationEvent,
    FirehoseTransformationEventRecord,
    FirehoseTransformationResult,
    FirehoseTransformationResultRecord,
    SQSEvent,
    SQSRecord,
} from 'aws-lambda';
import { ValidationService } from './services/validation-service';
import { SnsService } from './services/sns-service';
import { IRequiredFieldError } from './models/required-field-error.interface';
import { ValidationException } from './exceptions/validation-exception';
import { EnrichmentService } from './services/enrichment-service';
import { AuditEvent, IAuditEvent } from './models/audit-event';
import { KeyService } from './services/key-service';
import { ObfuscationService } from './services/obfuscation-service';

export const eventProcessorHandler = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        const validationResponse = await ValidationService.validateSQSRecord(record as SQSRecord);

        if (!validationResponse.isValid) {
            console.log(
                '[ERROR] VALIDATION ERROR\n' +
                    JSON.stringify(
                        new ValidationException(
                            'An event message failed validation.',
                            validationResponse.error as IRequiredFieldError,
                        ),
                    ),
            );
        } else {
            const message: IAuditEvent = await EnrichmentService.enrichValidationResponse(validationResponse);
            await SnsService.publishMessageToSNS(message, process.env.topicArn);
        }
    }

    return;
};

export const obfuscationHandler = async (event: FirehoseTransformationEvent): Promise<FirehoseTransformationResult> => {
    /* Process the list of records and transform them */
    let transformationResult: FirehoseRecordTransformationStatus = 'Ok';
    let hmacKey = '';

    try {
        hmacKey = await KeyService.getHmacKey();
    } catch (e) {
        transformationResult = 'ProcessingFailed';
        console.log('An error occurred getting the hmac key.  Failed with ' + e);
    }

    const output = event.records.map((record: FirehoseTransformationEventRecord) => {
        const plaintextData: string = Buffer.from(record.data, 'base64').toString('ascii');
        const events: unknown[] = JSON.parse(plaintextData);
        const obfuscatedEvents: IAuditEvent[] = [];
        let data: string;

        if (transformationResult === 'ProcessingFailed')
            return {
                recordId: record.recordId,
                result: transformationResult,
                data: record.data,
            } as FirehoseTransformationResultRecord;

        if (events.length > 0) {
            for (let i = 0; i < events.length; i++) {
                const auditEvent: IAuditEvent = AuditEvent.fromJSONString(JSON.stringify(events[i]));
                ObfuscationService.obfuscateEvent(auditEvent, hmacKey);
                obfuscatedEvents.push(auditEvent);
            }
            data = Buffer.from(JSON.stringify(obfuscatedEvents)).toString('base64');
        } else {
            const auditEvent: IAuditEvent = AuditEvent.fromJSONString(plaintextData);
            ObfuscationService.obfuscateEvent(auditEvent, hmacKey);
            data = Buffer.from(JSON.stringify(auditEvent)).toString('base64');
        }

        return {
            recordId: record.recordId,
            result: transformationResult,
            data: data,
        } as FirehoseTransformationResultRecord;
    });

    if (transformationResult === 'ProcessingFailed') {
        console.log(`Processing completed. Failed records ${output.length}.`);
    } else {
        console.log(`Processing completed. Successful records ${output.length}.`);
    }

    return { records: output };
};
