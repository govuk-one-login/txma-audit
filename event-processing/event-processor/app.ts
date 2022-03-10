import { SQSEvent } from 'aws-lambda';

export const handler = async (event: SQSEvent): Promise<string> => {
    //Perform Validation here

    return JSON.stringify(event.Records);
};
