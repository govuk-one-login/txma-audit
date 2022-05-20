import { SQSEvent, SQSRecord } from 'aws-lambda';
import { ValidationService } from './services/validation-service';
import { SnsService } from './services/sns-service';
import { IValidationResponse } from './models/validation-response.interface';
import { ValidationException } from './exceptions/validation-exception';
import { IRequiredFieldError } from './models/required-field-error.interface';
import { EnrichmentService } from './services/enrichment-service';

export const handler = async (event: SQSEvent): Promise<void> => {
    const validationResponses: IValidationResponse[] = [];
    const enrichedMessages: string[] = [];

    for (const record of event.Records) {
        validationResponses.push(await ValidationService.validateSQSRecord(record as SQSRecord));
    }

    if (validationResponses.some((response: IValidationResponse) => !response.isValid)) {
        console.log(
            '[ERROR] VALIDATION ERROR\n' +
                JSON.stringify(
                    new ValidationException(
                        'One or more event messages failed validation.',
                        validationResponses
                            .filter((response: IValidationResponse) => {
                                return !response.isValid;
                            })
                            .map((response: IValidationResponse) => {
                                return response.error as IRequiredFieldError;
                            }),
                    ),
                ),
        );
    }

    if (validationResponses.some((response: IValidationResponse) => response.isValid)) {
        const messages: string[] = validationResponses
            .filter((response: IValidationResponse) => {
                return response.isValid;
            })
            .map((validationResponse: IValidationResponse) => {
                return JSON.stringify(validationResponse.message);
            });

        for (const message of messages) {
            await SnsService.publishMessageToSNS(message, process.env.topicArn);
        }

        // Replace above with my code
      const validResponses = validationResponses.filter((response: IValidationResponse) => {
        return response.isValid;
      });
      for (const element of validResponses) {
        enrichedMessages.push(await EnrichmentService.enrichValidationResponse(element));
      }
    }

    if (enrichedMessages?.length) {
        await SnsService.publishMessageToSNS(JSON.stringify(enrichedMessages), process.env.topicArn);
    }
    return;
};
