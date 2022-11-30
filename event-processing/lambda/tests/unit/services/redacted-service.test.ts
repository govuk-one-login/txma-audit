/* eslint-disable */
import { IEnrichedAuditEvent } from '../../../models/enriched-audit-event';
import {TestHelper} from "../../test-helpers/test-helper";
import {AccountsRedactedService} from "../../../services/redacted-service";
import {IRedactedAuditEvent} from "../../../models/redacted-event";

describe('Unit test for accountsredacted-service', function () {
    it('returns a redacted event', async () => {
        const inputMessage: IEnrichedAuditEvent = {
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            event_id: '123456789',
            component_id: '1234',
            client_id: 'An Example Client',
            user: {
                transaction_id: 'a52f6f87',
            },
            reIngestCount: 0,
        };

        const expectedMessage: IRedactedAuditEvent = {
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            event_id: '123456789',
            client_id: 'An Example Client',
            user: {
                govuk_signin_journey_id: "",
                user_id: ""
            }
        };

        const data: string = Buffer.from(TestHelper.encodeAuditEvent(inputMessage)).toString();
        expect(AccountsRedactedService.applyRedaction(data)).toEqual(expectedMessage);
    });
});
