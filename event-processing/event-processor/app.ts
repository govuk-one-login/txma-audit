import { SQSEvent, SQSRecord } from 'aws-lambda';
import { ValidationService } from './services/validation-service';
import { SnsService } from './services/sns-service';
import { IRequiredFieldError } from './models/required-field-error.interface';
import { ValidationException } from './exceptions/validation-exception';
import { EnrichmentService } from './services/enrichment-service';

export const handler = async (event: SQSEvent): Promise<void> => {
    // const validationResponses: IValidationResponse[] = [];
    // const enrichedMessages: string[] = [];

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
            await SnsService.publishMessageToSNS(JSON.stringify(validationResponse.message), process.env.topicArn);
        }
    }

  // if (validationResponses.some((response: IValidationResponse) => response.isValid)) {
  //   const validResponses = validationResponses.filter((response: IValidationResponse) => {
  //     return response.isValid;
  //   });
  //   for (const element of validResponses) {
  //     enrichedMessages.push(await EnrichmentService.enrichValidationResponse(element));
  //   }
  // }
  //
  // if (enrichedMessages?.length) {
  //   for (const message of enrichedMessages) {
  //     await SnsService.publishMessageToSNS(JSON.stringify(message), process.env.topicArn);
  //   }
  // }
    return;
};
