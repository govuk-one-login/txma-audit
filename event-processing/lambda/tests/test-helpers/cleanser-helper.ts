/* istanbul ignore file */

import { IEnrichedAuditEvent } from '../../models/enriched-audit-event';
import { ICleansedEvent } from '../../models/cleansed-event';
import { ObfuscationService } from '../../services/obfuscation-service';

export class CleanserHelper {
    static exampleEnrichedMessage(): IEnrichedAuditEvent {
        return {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            reIngestCount: 0,
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
            },
            platform: {
                xray_trace_id: '24727sda4192',
            },
            restricted: {
                experian_ref: 'DSJJSEE29392',
                passport_number: 1040349934,
            },
            extensions: {
                response: 'Authentication successful',
                evidence: [
                    {
                        activityHistoryScore: 0,
                        identityFraudScore: 2,
                        strengthScore: 2,
                        validityScore: 2,
                        verificationScore: 2,
                        other_evidence: 'evidence',
                    },
                ],
            },
        };
    }

    static exampleEnrichedMessageWithScoresInOneEvidence(): IEnrichedAuditEvent {
        return {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            reIngestCount: 0,
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
            },
            platform: {
                xray_trace_id: '24727sda4192',
            },
            restricted: {
                experian_ref: 'DSJJSEE29392',
                passport_number: 1040349934,
            },
            extensions: {
                response: 'Authentication successful',
                evidence: [
                    {
                        activityHistoryScore: 0,
                        identityFraudScore: 2,
                        strengthScore: 2,
                        validityScore: 2,
                        verificationScore: 2,
                    },
                    {
                        other_evidence: 'evidence',
                    },
                ],
            },
        };
    }

    static exampleCleansedAndObfuscatedMessage(): ICleansedEvent {
        return {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            client_id: 'some-client',
            reIngestCount: 0,
            user: {
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                user_id: ObfuscationService.obfuscateField('some_user_id', 'secret-1-value'),
            },
            extensions: {
                evidence: [
                    {
                        activityHistoryScore: 0,
                        identityFraudScore: 2,
                        strengthScore: 2,
                        validityScore: 2,
                        verificationScore: 2,
                    },
                ],
            },
        };
    }

    static exampleEnrichedMessageWithTwoEvidence(): IEnrichedAuditEvent {
        return {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            client_id: 'some-client',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            reIngestCount: 0,
            user: {
                transaction_id: 'a52f6f87',
                user_id: 'some_user_id',
                email: 'foo@bar.com',
                phone: '07711223344',
                ip_address: '100.100.100.100',
                session_id: 'c222c1ec',
                persistent_session_id: 'some session id',
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                device_id: 'some known device',
            },
            platform: {
                xray_trace_id: '24727sda4192',
            },
            restricted: {
                experian_ref: 'DSJJSEE29392',
                passport_number: 1040349934,
            },
            extensions: {
                response: 'Authentication successful',
                evidence: [
                    {
                        activityHistoryScore: 0,
                        identityFraudScore: 2,
                        strengthScore: 2,
                        validityScore: 2,
                        verificationScore: 2,
                        other_evidence: 'evidence',
                    },
                    {
                        validityScore: 2,
                    },
                ],
            },
        };
    }

    static exampleCleansedMessageWithTwoEvidence(): ICleansedEvent {
        return {
            event_id: '66258f3e-82fc-4f61-9ba0-62424e1f06b4',
            event_name: 'AUTHENTICATION_ATTEMPT',
            component_id: 'AUTH',
            timestamp: 1609462861,
            timestamp_formatted: '2021-01-23T15:43:21.842',
            client_id: 'some-client',
            reIngestCount: 0,
            user: {
                govuk_signin_journey_id: '43143-233Ds-2823-283-dj299j1',
                user_id: ObfuscationService.obfuscateField('some_user_id', 'secret-1-value'),
            },
            extensions: {
                evidence: [
                    {
                        activityHistoryScore: 0,
                        identityFraudScore: 2,
                        strengthScore: 2,
                        validityScore: 2,
                        verificationScore: 2,
                    },
                    {
                        validityScore: 2,
                    },
                ],
            },
        };
    }
}
