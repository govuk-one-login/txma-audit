/* eslint-disable */
import { TestHelper } from '../test-helpers/test-helper';
import {AccountsRedactedService} from "../../services/redacted-service";
import {IAuditEvent, IAuditEventUserMessage} from "../../models/audit-event";
import {IRedactedAuditEvent} from "../../models/redacted-event";


describe('Unit test for app handler', function () {
    let consoleWarningMock: jest.SpyInstance;

    beforeEach(() => {
        consoleWarningMock = jest.spyOn(global.console, 'log');
    });

    afterEach(() => {
        consoleWarningMock.mockRestore();
    });

    it('redact a simple event without user object', async () => {
        const exampleMessage: IAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
        };

        const expectedResult: IRedactedAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            event_name: 'AUTHENTICATION_ATTEMPT',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            user: {
                govuk_signin_journey_id: "",
                user_id: ""
            }
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(exampleMessage)).toString();
        const result = AccountsRedactedService.applyRedaction(data);
            expect(result).toEqual(expectedResult);
    });

    it('redact a simple event with user object', async () => {

        const user: IAuditEventUserMessage = {
            transaction_id: 'aaaa-bbbb-cccc-dddd-1234',
            user_id: 'some_user_id',
            email: 'user@test.com',
            phone: '020 8888 8888',
            ip_address: '192.168.0.1',
            session_id: 'aaaa-bbbb-cccc-dddd-1234',
            persistent_session_id: 'aaaa-bbbb-cccc-dddd-1234',
            govuk_signin_journey_id: 'aaaa-bbbb-cccc-dddd-1234',
            device_id: 'some known device',
        };


        const exampleMessage: IAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user,

        };


        const expectedResult: IRedactedAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            event_name: 'AUTHENTICATION_ATTEMPT',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            user: {
                user_id: 'some_user_id',
                govuk_signin_journey_id: 'aaaa-bbbb-cccc-dddd-1234',
            },
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(exampleMessage)).toString();
        const result = AccountsRedactedService.applyRedaction(data);
        expect(result).toEqual(expectedResult);
    });

    it('redact a simple event with partial user object with user_id and without journey id', async () => {

        const user: IAuditEventUserMessage = {
            transaction_id: 'aaaa-bbbb-cccc-dddd-1234',
            user_id: 'some_user_id',
            email: 'user@test.com',
            phone: '020 8888 8888',
            ip_address: '192.168.0.1',
            session_id: 'aaaa-bbbb-cccc-dddd-1234',
            persistent_session_id: 'aaaa-bbbb-cccc-dddd-1234',
            device_id: 'some known device',
        };


        const exampleMessage: IAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user,

        };


        const expectedResult: IRedactedAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            event_name: 'AUTHENTICATION_ATTEMPT',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            user: {
                govuk_signin_journey_id: '',
                user_id: 'some_user_id',
            },
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(exampleMessage)).toString();
        const result = AccountsRedactedService.applyRedaction(data);
        expect(result).toEqual(expectedResult);
    });

    it('redact a simple event with partial user object with journey id and without user id', async () => {

        const user: IAuditEventUserMessage = {
            transaction_id: 'aaaa-bbbb-cccc-dddd-1234',
            email: 'user@test.com',
            phone: '020 8888 8888',
            ip_address: '192.168.0.1',
            session_id: 'aaaa-bbbb-cccc-dddd-1234',
            persistent_session_id: 'aaaa-bbbb-cccc-dddd-1234',
            govuk_signin_journey_id: 'aaaa-bbbb-cccc-dddd-1234',
            device_id: 'some known device',
        };


        const exampleMessage: IAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            user,

        };


        const expectedResult: IRedactedAuditEvent = {
            event_id: '123456789',
            client_id: 'My-client-id',
            event_name: 'AUTHENTICATION_ATTEMPT',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            user: {
                govuk_signin_journey_id: 'aaaa-bbbb-cccc-dddd-1234',
                user_id: ""
            },
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(exampleMessage)).toString();
        const result = AccountsRedactedService.applyRedaction(data);
        expect(result).toEqual(expectedResult);
    });

});
