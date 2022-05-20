import { SQSEvent, SQSRecord } from 'aws-lambda';
import { ValidationService } from './services/validation-service';
import { SnsService } from './services/sns-service';
import { IRequiredFieldError } from './models/required-field-error.interface';
import { ValidationException } from './exceptions/validation-exception';

export const handler = async (event: SQSEvent): Promise<void> => {
    for (const record of event.Records) {
        const validationResponse = await ValidationService.validateSQSRecord(record as SQSRecord);

        if (!validationResponse.isValid) {
            console.log(
                '[ERROR] VALIDATION ERROR\n' +
                    JSON.stringify(
                        new ValidationException(
                            'One or more event messages failed validation.',
                            validationResponse.error as IRequiredFieldError,
                        ),
                    ),
            );
        } else {
            await SnsService.publishMessageToSNS(JSON.stringify(validationResponse.message), process.env.topicArn);
        }
    }

    return;
};
