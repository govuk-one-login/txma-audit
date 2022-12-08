export class ObjectHelper {
    public static removeEmpty(obj: any): unknown {
        for (const propName in obj) {
            if (
                (obj[propName] === null || obj[propName] === undefined || obj[propName] == '') &&
                obj[propName] != '0'
            ) {
                delete obj[propName];
            } else if (Array.isArray(obj[propName])) {
                obj[propName].forEach((value: unknown, index: string | number) => {
                    obj[propName][index] = this.removeEmpty(value);
                });
            } else if (typeof obj[propName] === 'object') {
                obj[propName] = this.removeEmpty(obj[propName]);
            }
        }
        return obj;
    }

    // @ts-ignore
    public static getSQSURL = (sqsARN : string) : string => {
        const region = sqsARN.split(':')[3];
        const accountId = sqsARN.split(':')[4];
        const queueName: string = sqsARN.split(':')[5];
        const queueUrl = 'https://sqs.' + region + '.amazonaws.com/' + accountId + '/' + queueName;

        return queueUrl;
    }

    // @ts-ignore
    public static getBucketName = (s3ARN : string) : string => {
        const bucketName: string = s3ARN.split(':')[5];
        return bucketName;
    }
}
