import { SQSEvent } from 'aws-lambda';

export const handler = async (event: SQSEvent): Promise<void> => {
    /* copy and encrypt data */
    console.log(event);

    const eventDetails = parseEvent(event);

    const temporaryData = retrieveDataFromTemporary(eventDetails.filename);

    //to do - encrypt temporaryData;

    writeDataToPermanent(temporaryData);

    return;
};
