/* eslint-disable */
import { handler } from '../../firehoseTester-app';
import { Firehose } from 'aws-sdk';
import { MockedFunction } from 'ts-jest';
import { IAuditEvent } from '../../models/audit-event';
import { firehoseTesterHelper } from '../test-helpers/firehoseTester-helper';

jest.mock('aws-sdk', () => {
    const mockFirehoseInstance = {
        putRecord: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    const mockFirehose = jest.fn(() => mockFirehoseInstance);

    return {
        Firehose: mockFirehose,
        config: {
            update: jest.fn(),
        },
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
        const expectedResult =
            '{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","component_id":"AUTH","user":{"transaction_id":"a52f6f87","user_id":"some_user_id","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100","session_id":"c222c1ec","persistent_session_id":"some session id","govuk_signin_journey_id":"43143-233Ds-2823-283-dj299j1","device_id":"some known device"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"}}';

        const exampleMessage: IAuditEvent = firehoseTesterHelper.exampleAuditMessage();

        (firehose.putRecord().promise as MockedFunction<any>).mockResolvedValueOnce({
            Encrypted: false,
            RecordId: '1',
        });

        await handler(exampleMessage);

        expect(firehose.putRecord).toHaveBeenCalledWith({
            Record: { Data: expectedResult },
            DeliveryStreamName: 'SOME-FIREHOSE',
        });
        expect(consoleMock).toHaveBeenCalledTimes(1);
        expect(consoleMock).toHaveBeenNthCalledWith(1, 'MessageID is 1');
    });

    it('logs an Error if Firehose errors', async () => {
        const expectedResult =
            '{"event_id":"66258f3e-82fc-4f61-9ba0-62424e1f06b4","client_id":"some-client","timestamp":1609462861,"timestamp_formatted":"2021-01-23T15:43:21.842","event_name":"AUTHENTICATION_ATTEMPT","component_id":"AUTH","user":{"transaction_id":"a52f6f87","user_id":"some_user_id","email":"foo@bar.com","phone":"07711223344","ip_address":"100.100.100.100","session_id":"c222c1ec","persistent_session_id":"some session id","govuk_signin_journey_id":"43143-233Ds-2823-283-dj299j1","device_id":"some known device"},"platform":{"xray_trace_id":"24727sda4192"},"restricted":{"experian_ref":"DSJJSEE29392"},"extensions":{"response":"Authentication successful"}}';

        const exampleMessage: IAuditEvent = firehoseTesterHelper.exampleAuditMessage();

        (firehose.putRecord().promise as MockedFunction<any>).mockRejectedValueOnce(new Error('Firehose error'));

        await handler(exampleMessage);

        expect(firehose.putRecord).toHaveBeenCalledWith({
            Record: { Data: expectedResult },
            DeliveryStreamName: 'SOME-FIREHOSE',
        });
        expect(errorMock).toHaveBeenCalledTimes(2);
    });

    it('logs an Error if missing firehose name environment variable', async () => {
        delete process.env.firehoseName;

        const exampleMessage: IAuditEvent = firehoseTesterHelper.exampleAuditMessage();

        (firehose.putRecord().promise as MockedFunction<any>).mockRejectedValueOnce(new Error('Firehose error'));

        await expect(handler(exampleMessage)).rejects.toThrow(
            '[ERROR] ENV VAR MISSING: \n missing firehose name environment variable',
        );

        expect(errorMock).toHaveBeenCalledTimes(1);
    });
});
