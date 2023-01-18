/* eslint-disable */
import { CleansingService } from '../../../services/cleansing-service';
import { IEnrichedAuditEvent } from '../../../models/enriched-audit-event';
import { ICleansedEvent } from '../../../models/cleansed-event';

const inputMessage: IEnrichedAuditEvent = {
    timestamp: 1609462861,
    timestamp_formatted: '2021-01-23T15:43:21.842',
    event_name: 'AUTHENTICATION_ATTEMPT',
    event_id: '123456789',
    component_id: '1234',
    client_id: 'An Example Client',
    user: {
        transaction_id: 'a52f6f87',
        email: 'foo@bar.com',
        phone: '07711223344',
        ip_address: '100.100.100.100',
        session_id: 'c222c1ec',
        persistent_session_id: 'some session id',
        device_id: 'some known device',
    },
    reIngestCount: 0,
};

describe('Unit test for cleansing-service', function () {

    afterEach(() => {
        inputMessage.user = {
            transaction_id: 'a52f6f87',
            email: 'foo@bar.com',
            phone: '07711223344',
            ip_address: '100.100.100.100',
            session_id: 'c222c1ec',
            persistent_session_id: 'some session id',
            device_id: 'some known device',
        };
    })

    it('returns a cleansed event with all required user information', async () => {
        inputMessage.user = {
            ...inputMessage.user,
            user_id: 'some_user_id',
            govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1'
        };
        
        const expectedMessage: ICleansedEvent = {
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            event_id: '123456789',
            component_id: '1234',
            client_id: 'An Example Client',
            user: {
                user_id: 'some_user_id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
            },
            reIngestCount: 0,
        };

        expect(CleansingService.cleanseEvent(inputMessage)).toEqual(expectedMessage);
    });

    it('returns a cleansed event with only user_id', async () => {
        inputMessage.user = {
            ...inputMessage.user,
            user_id: 'some_user_id'
        };


        const expectedMessage: ICleansedEvent = {
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            event_id: '123456789',
            component_id: '1234',
            client_id: 'An Example Client',
            user: {
                user_id: 'some_user_id',
            },
            reIngestCount: 0,
        };

        expect(CleansingService.cleanseEvent(inputMessage)).toEqual(expectedMessage);
    });

    it('returns a cleansed event with only govuk_signin_journey_id', async () => {
        inputMessage.user = {
            ...inputMessage.user,
            govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1'
        };

        const expectedMessage: ICleansedEvent = {
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            event_id: '123456789',
            component_id: '1234',
            client_id: 'An Example Client',
            user: {
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
            },
            reIngestCount: 0,
        };

        expect(CleansingService.cleanseEvent(inputMessage)).toEqual(expectedMessage);
    });

    it('returns a cleansed event with no user information if required fields not present', async () => {
        const expectedMessage: ICleansedEvent = {
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            event_id: '123456789',
            component_id: '1234',
            client_id: 'An Example Client',
            reIngestCount: 0,
        };

        expect(CleansingService.cleanseEvent(inputMessage)).toEqual(expectedMessage);
    });
});
