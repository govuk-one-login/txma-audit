import { SQSEvent } from 'aws-lambda';

export const handler = async (event: SQSEvent): Promise<string> => {
    //Some validation

    return JSON.stringify(event.Records)
};
