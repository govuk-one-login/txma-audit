import { SNSEventRecord, SQSRecord } from 'aws-lambda';
import { Event } from './types/type-declarations';
import { validationService } from './services/validation-service';
import { IValidationResponse } from './models/validation-response.interface';
import { ValidationException } from './Exceptions/validation-exception';

export const handler = async (event: Event): Promise<string> => {
    const validationResponses: IValidationResponse[] = [];

    for (const record of event.Records) {
        if (validationService.isInstanceOfSNSRecord(record)) {
            validationResponses.push(await validationService.validateSNSEventRecord(record as SNSEventRecord));
        } else {
            validationResponses.push(await validationService.validateSQSRecord(record as SQSRecord));
        }
    }

    if (validationResponses.some((response: IValidationResponse) => !response.isValid)) {
        throw new ValidationException('One or more event messages failed validation.', validationResponses);
    }

    return JSON.stringify(
        validationResponses.map((validationResponse: IValidationResponse) => {
            return validationResponse.message;
        }),
    );
};
