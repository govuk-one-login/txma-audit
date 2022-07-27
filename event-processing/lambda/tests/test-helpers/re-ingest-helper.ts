/* istanbul ignore file */
import { S3Event } from 'aws-lambda/trigger/s3';

export class ReIngestHelper {
    static exampleS3Event(): S3Event {
        return {
            Records: [
                {
                    s3: {
                        bucket: {
                            arn: 'arn:aws:s3:::mybucket',
                            name: 'sourcebucket',
                            ownerIdentity: {
                                principalId: 'EXAMPLE',
                            },
                        },
                        configurationId: 'testConfigRule',
                        object: {
                            eTag: 'd41d8cd98f00b204e9800998ecf8427e',
                            key: 'Happy%20Face.jpg',
                            sequencer: 'Happy Sequencer',
                            size: 1024,
                            versionId: 'version',
                        },
                        s3SchemaVersion: '1.0',
                    },
                    userIdentity: {
                        principalId: 'EXAMPLE',
                    },
                    awsRegion: 'eu-west-2',
                    eventName: 'ObjectCreated:Put',
                    eventSource: 'aws:s3',
                    eventTime: '1970-01-01T00:00:00.123Z',
                    eventVersion: '2.0',
                    requestParameters: {
                        sourceIPAddress: '127.0.0.1',
                    },
                    responseElements: {
                        'x-amz-id-2': 'FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpD',
                        'x-amz-request-id': 'C3D13FE58DE4C810',
                    },
                },
            ],
        };
    }
}
