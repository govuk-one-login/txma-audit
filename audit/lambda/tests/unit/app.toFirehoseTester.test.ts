/* eslint-disable */
import { handler } from '../../firehoseTester-app';
import { Firehose } from "aws-sdk";
import {MockedFunction} from "ts-jest";

jest.mock('aws-sdk', () => {
    const mockFirehoseInstance = {
        putRecord: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    const mockFirehose = jest.fn(() => mockFirehoseInstance);

    return {
        Firehose: mockFirehose,
        config: {
            update: jest.fn()
        }
    };
});

describe('Unit test for app firehoseTesterHandler', function () {
    let consoleMock: jest.SpyInstance;
    let errorMock: jest.SpyInstance;
    let firehose: Firehose;

    beforeEach(() => {
        consoleMock = jest.spyOn(global.console, 'log');
        errorMock = jest.spyOn(global.console, 'error');
        firehose = new Firehose();

        process.env.firehoseName = 'SOME-FIREHOSE';
    });

    afterEach(() => {
        consoleMock.mockRestore();
        jest.clearAllMocks();
    });

    it('successfully sends a message to Firehose', async () => {
        const exampleMessage =
            '{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","component_id":"1234","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"}}';

        (firehose.putRecord().promise as MockedFunction<any>).mockResolvedValueOnce({"Encrypted": false, RecordId: "1" });

        await handler(exampleMessage);

        expect(firehose.putRecord).toHaveBeenCalledWith(
            {
                Record: { Data: exampleMessage },
                DeliveryStreamName: 'SOME-FIREHOSE',
            }
        );
        expect(consoleMock).toHaveBeenCalledTimes(1);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'MessageID is 1');
    });

    it('logs an Error if Firehose errors', async () => {
        const exampleMessage =
            '{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","component_id":"1234","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"}}';

        (firehose.putRecord().promise as MockedFunction<any>).mockRejectedValueOnce(new Error('Firehose error'));

        await handler(exampleMessage);

        expect(firehose.putRecord).toHaveBeenCalledWith(
            {
              Record: { Data: exampleMessage },
              DeliveryStreamName: 'SOME-FIREHOSE',
            }
        );
        expect(errorMock).toHaveBeenCalledTimes(1);
    });

    it('logs an Error if missing firehose name environment variable', async () => {
        delete(process.env.firehoseName);

        const exampleMessage =
            '{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","component_id":"1234","user":{"transaction_id":"a52f6f87","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"}}';

        (firehose.putRecord().promise as MockedFunction<any>).mockRejectedValueOnce(new Error('Firehose error'));

        await expect(handler(exampleMessage)).rejects.toThrow("[ERROR] ENV VAR MISSING: \n missing firehose name enironment variable");

        expect(errorMock).toHaveBeenCalledTimes(1);
    });
});
