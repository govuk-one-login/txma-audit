import { SQSEvent, SQSRecord } from 'aws-lambda';
import { validationService } from './services/validation-service';
import { IValidationResponse } from './models/validation-response.interface';
import { ValidationException } from './exceptions/validation-exception';

export const handler = async (event: SQSEvent): Promise<string> => {
    const validationResponses: IValidationResponse[] = [];

    for (const record of event.Records) {
        validationResponses.push(await validationService.validateSQSRecord(record as SQSRecord));
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
