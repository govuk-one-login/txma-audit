// import { SQSEvent } from 'aws-lambda';
// import { AWSError, SNS } from 'aws-sdk';
// import { handler } from '../../index';
//
// jest.mock('aws-sdk', () => {
//     const mockSNS = {
//         publish: jest.fn().mockReturnThis(),
//         promise: jest.fn(),
//     };
//     return { SNS: jest.fn(() => mockSNS) };
// });
//
// describe('Unit test for app handler', function () {
//     const event: SQSEvent = {
//         "Records": [
//             {
//                 "messageId" : "MessageID_1",
//                 "receiptHandle" : "MessageReceiptHandle",
//                 "body" : "Message Body",
//                 "md5OfBody" : "fce0ea8dd236ccb3ed9b37dae260836f",
//                 "eventSourceARN": "arn:aws:sqs:us-west-2:123456789012:SQSQueue",
//                 "eventSource": "aws:sqs",
//                 "awsRegion": "us-west-2",
//                 "attributes" : {
//                     "ApproximateReceiveCount" : "2",
//                     "SentTimestamp" : "1520621625029",
//                     "SenderId" : "AROAIWPX5BD2BHG722MW4:sender",
//                     "ApproximateFirstReceiveTimestamp" : "1520621634884"
//                 },
//                 "messageAttributes" : {
//                     "Attribute3" : {
//                         "binaryValue" : "MTEwMA==",
//                         "stringListValues" : ["abc", "123"],
//                         "binaryListValues" : ["MA==", "MQ==", "MA=="],
//                         "dataType" : "Binary"
//                     },
//                     "Attribute2" : {
//                         "stringValue" : "123",
//                         "stringListValues" : [ ],
//                         "binaryListValues" : ["MQ==", "MA=="],
//                         "dataType" : "Number"
//                     },
//                     "Attribute1" : {
//                         "stringValue" : "AttributeValue1",
//                         "stringListValues" : [ ],
//                         "binaryListValues" : [ ],
//                         "dataType" : "String"
//                     }
//                 }
//             }
//         ]
//     };
//
//     let sns;
//     let THIS_TOPIC_ARN
//
//     beforeEach(() => {
//         jest.resetModules();
//
//         sns = new SNS();
//
//         THIS_TOPIC_ARN = process.env.AUDIT_TOPIC_ARN;
//         process.env.AUDIT_TOPIC_ARN = 'OUR-SNS-TOPIC';
//     });
//
//     afterEach(() => {
//         jest.clearAllMocks();
//
//         process.env.AUDIT_TOPIC_ARN = THIS_TOPIC_ARN;
//     });
//
//     it('verifies successful response', async () => {
//
//         const mockedResponseData: SNS.PublishResponse = {
//             MessageId : "1"
//         };
//
//         sns.publish().promise.mockResolvedValueOnce(mockedResponseData);
//
//         const result = await handler(event);
//
//         expect(result).toEqual([mockedResponseData
//         ]);
//         expect(sns.publish).toBeCalledWith({ Message: JSON.stringify(event.Records[0].body), TopicArn: 'OUR-SNS-TOPIC' });
//         expect(sns.publish().promise).toBeCalledTimes(1);
//     });
//
//     it('AWS returns an error, expected message', async () => {
//
//         const mockedResponseData: AWSError = {
//             name: "Error 1",
//             message : "Something Went Wrong",
//             code: "code",
//             time: new Date()
//         };
//
//         sns.publish().promise.mockResolvedValueOnce(mockedResponseData);
//
//         const result = await handler(event);
//
//         expect(result).toEqual([mockedResponseData]);
//         expect(sns.publish).toBeCalledWith({ Message: JSON.stringify(event.Records[0].body), TopicArn: 'OUR-SNS-TOPIC' });
//         expect(sns.publish().promise).toBeCalledTimes(1);
//     });
// });
