import { SQSEvent } from 'aws-lambda';

export const handler = async (event: SQSEvent): Promise<void> => {
    /* copy and encrypt data */
    console.log('Handling initiate copyTemporaryToPermanent SQS event', JSON.stringify(event, null, 2));

    if (event.Records.length === 0) {
        throw new Error('No data in event');
    }

    const eventData = tryParseJSON(event.Records[0].body);

    console.log(eventData);

    // const temporaryData = retrieveDataFromTemporary(eventData.filename);

    // //to do - encrypt temporaryData;

    // writeDataToPermanent(temporaryData);

    return;
};

const tryParseJSON = (jsonString: string) => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON: ', error);
        return {};
    }
};
