import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { ErrorService } from './error-service';
import { unzip } from 'zlib';

export class S3Service {
    static client = new S3Client({ region: 'eu-west-2' });

    static async getObject(bucket: string, key: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const response = await this.client.send(
                    new GetObjectCommand({
                        Bucket: bucket,
                        Key: key,
                    }),
                );

                // Store all the data chunks returned from the response data stream
                const responseDataChunks: Buffer[] = [];
                const stream = response.Body as Readable;

                // Handle an error while streaming the response body
                stream.once('error', (err) => reject(err));

                // Attach a 'data' listener to add the chunks of data to our array
                // Each chunk is a Buffer instance
                stream.on('data', (chunk) => responseDataChunks.push(chunk));

                // Once the stream has no more data, join the chunks, unzip and return as string
                stream.once('end', () => {
                    unzip(Buffer.concat(responseDataChunks), (err, result: Buffer) => {
                        if (err) {
                            console.log(err);
                            throw err;
                        } else {
                            resolve(result.toString('utf8'));
                        }
                    });
                });
            } catch (error) {
                const errorWithMessage = ErrorService.toErrorWithMessage(error);
                console.log(`[ERROR] GET FROM S3 ERROR:\n Error: ${errorWithMessage.message}`, errorWithMessage.stack);
                return reject(error);
            }
        });
    }

    static async deleteObject(bucket: string, key: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const response = await this.client.send(
                    new DeleteObjectCommand({
                        Bucket: bucket,
                        Key: key,
                    }),
                );

                resolve(response.DeleteMarker as boolean);
            } catch (error) {
                const errorWithMessage = ErrorService.toErrorWithMessage(error);
                console.log(
                    `[ERROR] DELETE FROM S3 ERROR:\n Error: ${errorWithMessage.message}`,
                    errorWithMessage.stack,
                );
                return reject(error);
            }
        });
    }
}
