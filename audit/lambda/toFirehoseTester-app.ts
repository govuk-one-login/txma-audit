import { config, Firehose } from "aws-sdk";

export const handler = async (record: String): Promise<void> => {

  config.update({ region: process.env.AWS_REGION });

  const firehose = new Firehose({apiVersion: '2015-08-04'});

  if (process.env.firehoseName){
    var params: Firehose.PutRecordInput = {
        DeliveryStreamName: process.env.firehoseName,
        Record: { Data: record },
    };
  } else {
    console.error("[ERROR] ENV VAR MISSING: \n missing firehose name enironment variable");
    throw new Error("[ERROR] ENV VAR MISSING: \n missing firehose name enironment variable");
  }

  const sendTextPromise = firehose.putRecord(params).promise();

  await sendTextPromise
      .then((data) => {
          console.log('MessageID is ' + data.RecordId);
      })
      .catch((err) => {
          console.error(err, err.stack);
      });

  return;
};
